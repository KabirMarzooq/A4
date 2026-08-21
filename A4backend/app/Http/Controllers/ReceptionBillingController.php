<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Receipt;
use App\Models\SystemLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReceptionBillingController extends Controller
{
    /**
     * Write a bill directly — reception/admin billing a patient for
     * something that didn't come from a doctor's visit record (which no
     * longer generates invoices at all, see PatientFolderController) or a
     * lab order (still unpriced). Either an online patient (patient_id) or
     * a walk-in patient_file — never neither, matching how every other
     * invoice source on this table already branches.
     */
    public function storeInvoice(Request $request)
    {
        $request->validate([
            'patient_id'           => 'nullable|exists:users,id|required_without:patient_file_id',
            'patient_file_id'      => 'nullable|exists:patient_files,id|required_without:patient_id',
            'items'                => 'required|array|min:1',
            'items.*.description'  => 'required|string|max:255',
            'items.*.quantity'     => 'required|integer|min:1',
            'items.*.unit_price'   => 'required|numeric|min:0',
            'due_date'             => 'nullable|date',
        ]);

        $invoice = DB::transaction(function () use ($request) {
            $subtotal = collect($request->items)
                ->sum(fn($i) => $i['quantity'] * $i['unit_price']);

            $invoice = Invoice::create([
                'invoice_number'  => Invoice::generateInvoiceNumber(),
                'patient_id'      => $request->patient_id,
                'patient_file_id' => $request->patient_file_id,
                'type'            => 'reception_bill',
                'subtotal'        => $subtotal,
                'service_charge'  => 0,
                'total_amount'    => $subtotal,
                'currency'        => 'NGN',
                'status'          => 'unpaid',
                'due_date'        => $request->due_date ?? now()->addDays(3),
            ]);

            foreach ($request->items as $item) {
                InvoiceItem::create([
                    'invoice_id'  => $invoice->id,
                    'description' => $item['description'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return $invoice;
        });

        SystemLog::log(
            'invoice.created_manual',
            Auth::user()->name . ' created invoice ' . $invoice->invoice_number
                . ' for ₦' . number_format((float) $invoice->total_amount, 2),
            $invoice
        );

        return response()->json($invoice->load('items'), 201);
    }

    /**
     * Get all invoices across all patients.
     * Supports search by patient name.
     */
    public function allBills(Request $request)
    {
        $search = $request->query('search');

        $invoices = Invoice::with([
            'patient:id,name,email,phone',
            'patientFile.folder',
            'folder',
            'doctor:id,name,specialization,role',
            'appointment:id,appointment_date,appointment_time',
            'items',
            'receipt',
        ])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('patient', function ($q2) use ($search) {
                        $q2->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%');
                    })
                        ->orWhereHas('patientFile', function ($q2) use ($search) {
                            $q2->where('first_name', 'like', '%' . $search . '%')
                                ->orWhere('last_name', 'like', '%' . $search . '%');
                        })
                        ->orWhereHas('folder', function ($q2) use ($search) {
                            $q2->where('folder_name', 'like', '%' . $search . '%')
                                ->orWhere('phone', 'like', '%' . $search . '%');
                        });
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Summary stats — "unpaid" here means "still owes something",
        // summed as the actual remaining balance so a partially-paid
        // invoice doesn't count its already-collected portion twice.
        $totalUnpaid   = $invoices
            ->whereIn('status', ['unpaid', 'overdue', 'partially_paid'])
            ->sum(fn($i) => $i->outstandingBalance());
        $totalPaid     = $invoices->where('status', 'paid')->sum('total_amount')
            + $invoices->where('status', 'partially_paid')->sum('amount_paid');
        $unpaidCount   = $invoices->whereIn('status', ['unpaid', 'overdue', 'partially_paid'])->count();
        $paidCount     = $invoices->where('status', 'paid')->count();

        return response()->json([
            'invoices'     => $invoices,
            'stats' => [
                'total_unpaid'  => $totalUnpaid,
                'total_paid'    => $totalPaid,
                'unpaid_count'  => $unpaidCount,
                'paid_count'    => $paidCount,
            ],
        ]);
    }

    /**
     * Get a single invoice with full details.
     */
    public function showInvoice($id)
    {
        $invoice = Invoice::with([
            'patient:id,name,email,phone',
            'patientFile.folder',
            'folder',
            'doctor:id,name,specialization,role',
            'appointment:id,appointment_date,appointment_time,reason',
            'items',
            'receipt',
            'payment',
        ])->findOrFail($id);

        return response()->json($invoice);
    }

    /**
     * Record a manually-collected payment (cash, POS, bank transfer, or other).
     * Receptionist collects payment physically at the desk and records it here.
     * Accepts a partial amount — anything less than the outstanding balance
     * leaves the invoice 'partially_paid' with the remainder still owed;
     * omitting amount pays the full remaining balance, same as before this
     * supported partial payments at all.
     */
    public function markCashPaid(Request $request, $invoiceId)
    {
        $request->validate([
            'payment_method' => 'required|string|in:cash,pos,transfer,other',
            'amount'         => 'nullable|numeric|min:0.01',
            'received_by'    => 'nullable|string|max:100',
            'notes'          => 'nullable|string|max:255',
        ]);

        $invoice = Invoice::with(['patient', 'patientFile'])
            ->where('id', $invoiceId)
            ->whereIn('status', ['unpaid', 'overdue', 'partially_paid'])
            ->firstOrFail();

        $balance = $invoice->outstandingBalance();
        $amount  = $request->filled('amount') ? round((float) $request->amount, 2) : $balance;

        if ($amount > $balance + 0.01) {
            return response()->json([
                'message' => 'Amount exceeds the outstanding balance of ' . number_format($balance, 2) . '.',
            ], 422);
        }

        DB::transaction(function () use ($invoice, $request, $amount) {
            $method = $request->payment_method;

            // Create payment record
            $payment = Payment::create([
                'invoice_id'        => $invoice->id,
                'patient_id'        => $invoice->patient_id ?? null,
                'amount'            => $amount,
                'currency'          => 'NGN',
                'status'            => 'successful',
                'gateway'           => $method,
                'gateway_reference' => strtoupper($method) . '-' . strtoupper(uniqid()),
                'gateway_response'  => [
                    'method'      => $method,
                    'received_by' => $request->received_by ?? Auth::user()->name,
                    'notes'       => $request->notes,
                    'processed_by_id' => Auth::id(),
                ],
                'payment_method'    => $method,
                'paid_at'           => now(),
            ]);

            $newAmountPaid = round((float) $invoice->amount_paid + $amount, 2);
            $isFullyPaid   = $newAmountPaid >= (float) $invoice->total_amount - 0.01;

            $invoice->update([
                'amount_paid' => $newAmountPaid,
                'status'      => $isFullyPaid ? 'paid' : 'partially_paid',
                'paid_at'     => $isFullyPaid ? now() : $invoice->paid_at,
            ]);

            // Generate a receipt for THIS payment — a partially-paid invoice
            // ends up with one receipt per instalment.
            Receipt::create([
                'receipt_number' => Receipt::generateReceiptNumber(),
                'payment_id'     => $payment->id,
                'invoice_id'     => $invoice->id,
                'patient_id'     => $invoice->patient_id ?? null,
                'amount_paid'    => $amount,
                'currency'       => 'NGN',
                'payment_method' => $method,
                'issued_at'      => now(),
            ]);
        });

        return response()->json([
            'message' => 'Payment recorded and receipt generated successfully.',
        ]);
    }

    /**
     * Initialize Paystack payment on behalf of a patient.
     * Same as patient side but receptionist triggers it.
     */
    public function initializeCardPayment(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
        ]);

        $invoice = Invoice::with(['patient:id,name,email', 'patientFile.folder'])
            ->where('id', $request->invoice_id)
            ->whereIn('status', ['unpaid', 'overdue', 'partially_paid'])
            ->firstOrFail();

        // Only the remaining balance — matters once an invoice already has
        // a partial cash payment against it and the rest is paid by card.
        $amountInKobo = (int) round($invoice->outstandingBalance() * 100);

        // Use patient's email for Paystack
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.paystack.co/transaction/initialize');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . config('paystack.secretKey'),
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'email'     => $invoice->patient?->email ??  'a4consortium@gmail.com',
            'amount'    => $amountInKobo,
            'currency'  => 'NGN',
            'reference' => 'A4C-' . $invoice->id . '-' . strtoupper(uniqid()),
            'metadata'  => [
                'invoice_id'     => $invoice->id,
                'patient_id'     => $invoice->patient_id,
                'invoice_number' => $invoice->invoice_number,
                'processed_by'   => Auth::user()->name,
            ],
        ]));

        $result   = curl_exec($ch);
        curl_close($ch);
        $response = json_decode($result, true);

        if (!$response || !$response['status']) {
            return response()->json([
                'message' => 'Could not initialize payment.'
            ], 500);
        }

        // Save pending payment
        Payment::create([
            'invoice_id'        => $invoice->id,
            'patient_id'        => $invoice->patient_id,
            'amount'            => $amountInKobo / 100,
            'currency'          => 'NGN',
            'status'            => 'pending',
            'gateway'           => 'paystack',
            'gateway_reference' => $response['data']['reference'],
        ]);

        return response()->json([
            'access_code'       => $response['data']['access_code'],
            'reference'         => $response['data']['reference'],
            'authorization_url' => $response['data']['authorization_url'],
        ]);
    }

    /**
     * Get a single receipt.
     */
    public function showReceipt($id)
    {
        $receipt = Receipt::with([
            'invoice.items',
            'invoice.doctor:id,name,specialization,role',
            'invoice.appointment:id,appointment_date,appointment_time',
            'invoice.patient:id,name,email,phone',
            'invoice.patientFile.folder',
            'invoice.folder',
            'payment',
        ])->findOrFail($id);

        return response()->json($receipt);
    }
}
