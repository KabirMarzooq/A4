<?php

namespace App\Http\Controllers;

use App\Models\Drug;
use App\Models\PharmacySale;
use App\Models\PharmacySaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PharmacySaleController extends Controller
{
    /**
     * Get or create today's sale session.
     * Also returns today's items and sales history.
     */
    public function today()
    {
        $today = now()->format('Y-m-d');

        // Get or create today's sale
        $sale = PharmacySale::firstOrCreate(
            ['sale_date' => $today],
            [
                'receptionist_id' => Auth::id(),
                'total_amount'    => 0,
                'status'          => 'open',
            ]
        );

        // Load items with drug info
        $sale->load('items.drug');

        // Sales history — past closed days
        $history = PharmacySale::with('items')
            ->where('status', 'closed')
            ->orderBy('sale_date', 'desc')
            ->take(30)
            ->get();

        return response()->json([
            'today'   => $sale,
            'history' => $history,
        ]);
    }

    /**
     * Add a drug to today's sale.
     * Checks stock before adding.
     */
    public function addItem(Request $request)
    {
        $request->validate([
            'drug_id'  => 'required|exists:drugs,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $drug = Drug::findOrFail($request->drug_id);

        // Stock check
        if ($drug->stock_quantity < $request->quantity) {
            return response()->json([
                'message' => "Insufficient stock. Only {$drug->stock_quantity} unit(s) available for {$drug->name}.",
            ], 422);
        }

        $today = now()->format('Y-m-d');

        // Get today's sale — must be open
        $sale = PharmacySale::where('sale_date', $today)
            ->where('status', 'open')
            ->firstOrFail();

        // Check if this drug already exists in today's sale
        $existing = $sale->items()->where('drug_id', $drug->id)->first();

        if ($existing) {
            // Update quantity instead of adding duplicate
            $newQty        = $existing->quantity + $request->quantity;
            $newTotalPrice = $drug->unit_price * $newQty;

            // Re-check stock for combined quantity
            if ($drug->stock_quantity < $newQty) {
                return response()->json([
                    'message' => "Insufficient stock for combined quantity. Available: {$drug->stock_quantity}.",
                ], 422);
            }

            $existing->update([
                'quantity'    => $newQty,
                'total_price' => $newTotalPrice,
            ]);
        } else {
            // Add new item line
            $sale->items()->create([
                'drug_id'    => $drug->id,
                'drug_name'  => $drug->name,
                'quantity'   => $request->quantity,
                'unit_price' => $drug->unit_price,
                'total_price' => $drug->unit_price * $request->quantity,
            ]);
        }

        // Deduct from inventory immediately
        $drug->decrement('stock_quantity', $request->quantity);

        // Recalculate total
        $sale->recalculateTotal();
        $sale->load('items.drug');

        return response()->json([
            'message' => "{$drug->name} added to today's sale.",
            'sale'    => $sale,
        ]);
    }

    /**
     * Update quantity of an existing sale item.
     */
    public function updateItem(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = PharmacySaleItem::with('drug', 'sale')->findOrFail($itemId);

        // Only allow editing open sales
        if ($item->sale->status === 'closed') {
            return response()->json(['message' => 'Cannot edit a closed sale.'], 403);
        }

        $drug        = $item->drug;
        $oldQty      = $item->quantity;
        $newQty      = $request->quantity;
        $difference  = $newQty - $oldQty;

        // If increasing quantity, check stock
        if ($difference > 0 && $drug->stock_quantity < $difference) {
            return response()->json([
                'message' => "Insufficient stock. Only {$drug->stock_quantity} additional unit(s) available.",
            ], 422);
        }

        // Adjust inventory
        if ($difference > 0) {
            $drug->decrement('stock_quantity', $difference);
        } elseif ($difference < 0) {
            $drug->increment('stock_quantity', abs($difference));
        }

        $item->update([
            'quantity'    => $newQty,
            'total_price' => $item->unit_price * $newQty,
        ]);

        $item->sale->recalculateTotal();
        $item->sale->load('items.drug');

        return response()->json([
            'message' => 'Item updated.',
            'sale'    => $item->sale,
        ]);
    }

    /**
     * Remove an item from today's sale and restore stock.
     */
    public function removeItem($itemId)
    {
        $item = PharmacySaleItem::with('drug', 'sale')->findOrFail($itemId);

        if ($item->sale->status === 'closed') {
            return response()->json(['message' => 'Cannot edit a closed sale.'], 403);
        }

        // Restore stock
        $item->drug->increment('stock_quantity', $item->quantity);

        $sale = $item->sale;
        $item->delete();

        $sale->recalculateTotal();
        $sale->load('items.drug');

        return response()->json([
            'message' => 'Item removed and stock restored.',
            'sale'    => $sale,
        ]);
    }

    /**
     * Manually close today's sale (called at end of day or by scheduler).
     */
    public function closeSale()
    {
        $today = now()->format('Y-m-d');

        $sale = PharmacySale::where('sale_date', $today)
            ->where('status', 'open')
            ->firstOrFail();

        $sale->update([
            'status'    => 'closed',
            'closed_at' => now()->toDateTimeString(),
        ]);

        return response()->json([
            'message' => "Today's sale has been closed. Total: ₦" .
                number_format($sale->total_amount, 2),
            'sale' => $sale,
        ]);
    }

    /**
     * Get a specific past sale with full details.
     */
    public function showHistory($saleId)
    {
        $sale = PharmacySale::with('items.drug', 'receptionist:id,name')
            ->findOrFail($saleId);

        return response()->json($sale);
    }

    /**
     * Auto-close scheduler method — called by cron at 10pm.
     * Register in app/Console/Kernel.php
     */
    public function autoClose()
    {
        $today = now()->format('Y-m-d');

        $sale = PharmacySale::where('sale_date', $today)
            ->where('status', 'open')
            ->first();

        if ($sale) {
            $sale->update([
                'status'    => 'closed',
                'closed_at' => now(),
            ]);
        }
    }
}
