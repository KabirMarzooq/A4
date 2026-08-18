<?php

namespace App\Http\Controllers;

use App\Models\Drug;
use Illuminate\Http\Request;

class DrugController extends Controller
{
    /**
     * Get all drugs with optional search and category filter
     */
    public function index(Request $request)
    {
        $search   = $request->query('search');
        $category = $request->query('category');

        $drugs = Drug::when(
            $search,
            fn($q) =>
            $q->where('name', 'like', '%' . $search . '%')
        )
            ->when(
                $category,
                fn($q) =>
                $q->where('category', $category)
            )
            ->orderBy('name')
            ->get();

        $lowStock    = $drugs->where('stock_status', 'low_stock')->count();
        $outOfStock  = $drugs->where('stock_status', 'out_of_stock')->count();
        $categories  = Drug::distinct()->pluck('category')->sort()->values();

        return response()->json([
            'drugs'        => $drugs,
            'alerts' => [
                'low_stock'   => $lowStock,
                'out_of_stock' => $outOfStock,
            ],
            'categories' => $categories,
        ]);
    }

    /**
     * Add a new drug to inventory
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'category'            => 'required|string|max:100',
            'unit_type'           => 'required|string|max:50',
            'unit_price'          => 'required|numeric|min:0',
            'stock_quantity'      => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:1',
            'description'         => 'nullable|string',
        ]);

        $drug = Drug::create($validated);

        return response()->json($drug, 201);
    }

    /**
     * Update drug details (name, price, category, etc.)
     */
    public function update(Request $request, $id)
    {
        $drug = Drug::findOrFail($id);

        $validated = $request->validate([
            'name'                => 'sometimes|string|max:255',
            'category'            => 'sometimes|string|max:100',
            'unit_type'           => 'sometimes|string|max:50',
            'unit_price'          => 'sometimes|numeric|min:0',
            'stock_quantity'      => 'sometimes|integer|min:0',
            'low_stock_threshold' => 'sometimes|integer|min:1',
            'description'         => 'nullable|string',
        ]);

        $drug->update($validated);

        return response()->json($drug);
    }

    /**
     * Quick restock — only adds to existing quantity
     */
    public function restock(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $drug = Drug::findOrFail($id);
        $drug->increment('stock_quantity', $request->quantity);
        $drug->refresh();

        return response()->json([
            'message'        => "Added {$request->quantity} units to {$drug->name}.",
            'drug'           => $drug,
        ]);
    }

    /**
     * Delete a drug from inventory
     */
    public function destroy($id)
    {
        $drug = Drug::findOrFail($id);
        $drug->delete();

        return response()->json(['message' => 'Drug removed from inventory.']);
    }
}
