<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReceptionBillingController extends Controller
{
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

        // Summary stats
        $totalUnpaid   = $invoices->whereIn('status', ['unpaid', 'overdue'])->sum('total_amount');
        $totalPaid     = $invoices->where('status', 'paid')->sum('total_amount');
        $unpaidCount   = $invoices->whereIn('status', ['unpaid', 'overdue'])->count();
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
     */
    public function markCashPaid(Request $request, $invoiceId)
    {
        $request->validate([
            'payment_method' => 'required|string|in:cash,pos,transfer,other',
            'received_by'    => 'nullable|string|max:100',
            'notes'          => 'nullable|string|max:255',
        ]);

        $invoice = Invoice::with(['patient', 'patientFile'])
            ->where('id', $invoiceId)
            ->whereIn('status', ['unpaid', 'overdue'])
            ->firstOrFail();

        $patientId   = $invoice->patient_id;
        $patientName = $invoice->patient?->name
            ?? ($invoice->patientFile
                ? $invoice->patientFile->first_name . ' ' . $invoice->patientFile->last_name
                : 'Walk-in Patient');

        DB::transaction(function () use ($invoice, $request) {
            $method = $request->payment_method;

            // Create payment record
            $payment = Payment::create([
                'invoice_id'        => $invoice->id,
                'patient_id'        => $invoice->patient_id ?? null,
                'amount'            => $invoice->total_amount,
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

            // Mark invoice as paid
            $invoice->update([
                'status'  => 'paid',
                'paid_at' => now(),
            ]);

            // Generate receipt
            Receipt::create([
                'receipt_number' => Receipt::generateReceiptNumber(),
                'payment_id'     => $payment->id,
                'invoice_id'     => $invoice->id,
                'patient_id'     => $invoice->patient_id ?? null,
                'amount_paid'    => $invoice->total_amount,
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
            ->whereIn('status', ['unpaid', 'overdue'])
            ->firstOrFail();

        $amountInKobo = (int) ($invoice->total_amount * 100);

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
            'amount'            => $invoice->total_amount,
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
