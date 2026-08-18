<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Receipt;
use App\Models\Appointment;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    // ── CONSTANTS ────────────────────────────────────────────────────────────
    const CONSULTATION_FEE  = 3000.00;  // ₦15,000
    const SERVICE_CHARGE_RATE = 0.02;    // 2%

    // ─────────────────────────────────────────────────────────────────────────
    // DOCTOR: Generate consultation invoice when accepting an appointment
    // Called automatically from AppointmentController::acceptAppointment()
    // ─────────────────────────────────────────────────────────────────────────
    // NOTE: no longer called (see AppointmentController::acceptAppointment) —
    // appointments/consultations have no fixed price at this hospital, so
    // accepting an appointment must not generate a bill. Left here, and left
    // free of a service charge, in case a fixed-fee model returns.
    public static function generateConsultationInvoice(Appointment $appointment): Invoice
    {
        $subtotal = self::CONSULTATION_FEE;
        // $serviceCharge  = round($subtotal * self::SERVICE_CHARGE_RATE, 2);
        $total = $subtotal;

        return DB::transaction(function () use ($appointment, $subtotal, $total) {
            // Create invoice
            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'patient_id'     => $appointment->patient_id,
                'doctor_id'      => $appointment->doctor_id,
                'appointment_id' => $appointment->id,
                'type'           => 'consultation',
                'subtotal'       => $subtotal,
                'service_charge' => 0,
                'total_amount'   => $total,
                'currency'       => 'NGN',
                'status'         => 'unpaid',
                // Due 24 hours before the appointment
                'due_date'       => \Carbon\Carbon::parse($appointment->appointment_date . ' ' . $appointment->appointment_time)->subHours(24),
            ]);

            // Create line items
            InvoiceItem::create([
                'invoice_id'  => $invoice->id,
                'description' => 'Consultation Fee',
                'quantity'    => 1,
                'unit_price'  => $subtotal,
                'total_price' => $subtotal,
            ]);

            // InvoiceItem::create([
            //     'invoice_id'  => $invoice->id,
            //     'description' => 'Platform Service Charge (2%)',
            //     'quantity'    => 1,
            //     'unit_price'  => $serviceCharge,
            //     'total_price' => $serviceCharge,
            // ]);

            return $invoice;
        });
    }

    public static function generatePrescriptionInvoice(Prescription $prescription, array $drugs): Invoice
    {
        $subtotal = collect($drugs)->sum('total');
        // No platform service charge (was 2%) — the bill is just the actual
        // drug prices from inventory. Commented out, not deleted.
        // $serviceCharge = round($subtotal * self::SERVICE_CHARGE_RATE, 2);
        $total = $subtotal;

        return DB::transaction(function () use ($prescription, $drugs, $subtotal, $total) {
            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'patient_id'     => $prescription->patient_id,
                'doctor_id'      => $prescription->doctor_id,
                'type'           => 'prescription',
                'subtotal'       => $subtotal,
                'service_charge' => 0,
                'total_amount'   => $total,
                'currency'       => 'NGN',
                'status'         => 'unpaid',
                'due_date'       => now()->addDays(3),
            ]);

            // One line item per drug
            foreach ($drugs as $drug) {
                InvoiceItem::create([
                    'invoice_id'  => $invoice->id,
                    'description' => $drug['drug_name'],
                    'quantity'    => $drug['quantity'],
                    'unit_price'  => $drug['unit_price'],
                    'total_price' => $drug['total'],
                ]);
            }

            // // Service charge line item
            // InvoiceItem::create([
            //     'invoice_id'  => $invoice->id,
            //     'description' => 'Platform Service Charge (2%)',
            //     'quantity'    => 1,
            //     'unit_price'  => $serviceCharge,
            //     'total_price' => $serviceCharge,
            // ]);

            return $invoice;
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATIENT: Get all their bills (unpaid + paid history)
    // ─────────────────────────────────────────────────────────────────────────
    public function myBills()
    {
        $patientId = Auth::id();

        $invoices = Invoice::where('patient_id', $patientId)
            ->with([
                'items',
                'doctor:id,name,specialization,role',
                'appointment:id,appointment_date,appointment_time',
                'receipt',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        // Summary stats
        $totalOutstanding = $invoices
            ->whereIn('status', ['unpaid', 'overdue'])
            ->sum('total_amount');

        $unpaidCount = $invoices->whereIn('status', ['unpaid', 'overdue'])->count();

        return response()->json([
            'invoices'         => $invoices,
            'total_outstanding' => $totalOutstanding,
            'unpaid_count'     => $unpaidCount,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATIENT: Get a single invoice with full details
    // ─────────────────────────────────────────────────────────────────────────
    public function showInvoice($id)
    {
        $invoice = Invoice::where('id', $id)
            ->where('patient_id', Auth::id()) // Security: own invoice only
            ->with([
                'items',
                'doctor:id,name,specialization,role',
                'appointment:id,appointment_date,appointment_time,reason',
                'receipt',
                'payment',
            ])
            ->firstOrFail();

        return response()->json($invoice);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATIENT: Get a single receipt
    // ─────────────────────────────────────────────────────────────────────────
    public function showReceipt($id)
    {
        $receipt = Receipt::where('id', $id)
            ->where('patient_id', Auth::id())
            ->with([
                'invoice.items',
                'invoice.doctor:id,name,specialization,role',
                'invoice.appointment:id,appointment_date,appointment_time',
                'payment',
            ])
            ->firstOrFail();

        return response()->json($receipt);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DOCTOR: See revenue overview — payments received for their patients
    // ─────────────────────────────────────────────────────────────────────────
    public function doctorRevenue()
    {
        $doctorId = Auth::id();

        $invoices = Invoice::where('doctor_id', $doctorId)
            ->with([
                'patient:id,name',
                'receipt',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        $thisMonth = $invoices
            ->where('status', 'paid')
            ->filter(fn($i) => $i->paid_at && $i->paid_at->isCurrentMonth())
            ->sum('total_amount');

        $totalEarnings = $invoices->where('status', 'paid')->sum('total_amount');
        $pendingAmount = $invoices->whereIn('status', ['unpaid', 'overdue'])->sum('total_amount');

        return response()->json([
            'invoices'       => $invoices,
            'this_month'     => $thisMonth,
            'total_earnings' => $totalEarnings,
            'pending_amount' => $pendingAmount,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL: Mark invoice as paid and generate receipt
    // This will be called by the Paystack webhook in Phase 2
    // For Phase 1, we expose it manually for testing
    // ─────────────────────────────────────────────────────────────────────────
    public function markPaid(Request $request, $invoiceId)
    {
        $invoice = Invoice::where('id', $invoiceId)
            ->where('status', 'unpaid')
            ->firstOrFail();

        DB::transaction(function () use ($invoice, $request) {
            // Create payment record
            $payment = Payment::create([
                'invoice_id'        => $invoice->id,
                'patient_id'        => $invoice->patient_id,
                'amount'            => $invoice->total_amount,
                'currency'          => 'NGN',
                'status'            => 'successful',
                'gateway'           => 'paystack',
                'gateway_reference' => $request->reference ?? 'MANUAL-TEST',
                'payment_method'    => $request->payment_method ?? 'card',
                'paid_at'           => now(),
            ]);

            // Update invoice
            $invoice->update([
                'status'  => 'paid',
                'paid_at' => now(),
            ]);

            // Generate receipt
            Receipt::create([
                'receipt_number' => Receipt::generateReceiptNumber(),
                'payment_id'     => $payment->id,
                'invoice_id'     => $invoice->id,
                'patient_id'     => $invoice->patient_id,
                'amount_paid'    => $invoice->total_amount,
                'currency'       => 'NGN',
                'payment_method' => $request->payment_method ?? 'card',
                'issued_at'      => now(),
            ]);

            // Decrement stock for prescription invoices
            if ($invoice->type === 'prescription') {
                $items = \App\Models\InvoiceItem::where('invoice_id', $invoice->id)
                    ->whereNot('description', 'like', '%Service Charge%')
                    ->get();

                foreach ($items as $item) {
                    \App\Models\Drug::where('name', $item->description)
                        ->decrement('stock_quantity', $item->quantity);
                }
            }
        });

        return response()->json(['message' => 'Invoice marked as paid and receipt generated.']);
    }
}
