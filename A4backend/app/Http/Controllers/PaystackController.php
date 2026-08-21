<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PaystackController extends Controller
{
    public function initializePayment(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
        ]);

        $invoice = Invoice::where('id', $request->invoice_id)
            ->where('patient_id', Auth::id())
            ->whereIn('status', ['unpaid', 'overdue', 'partially_paid'])
            ->firstOrFail();

        $patient = Auth::user();

        $amountInKobo = (int) round($invoice->outstandingBalance() * 100);

        $response = $this->callPaystack('POST', '/transaction/initialize', [
            'email'     => $patient->email,
            'amount'    => $amountInKobo,
            'currency'  => 'NGN',
            'reference' => $this->generateReference($invoice->id),
            'metadata'  => [
                'invoice_id'   => $invoice->id,
                'patient_id'   => $patient->id,
                'invoice_number' => $invoice->invoice_number,
                'cancel_action' => config('app.frontend_url') . '/dashboard/bills',
            ],
        ]);

        if (!$response || !$response['status']) {
            return response()->json([
                'message' => 'Could not initialize payment. Please try again.'
            ], 500);
        }

        Payment::create([
            'invoice_id'        => $invoice->id,
            'patient_id'        => $patient->id,
            'amount'            => $amountInKobo / 100,
            'currency'          => 'NGN',
            'status'            => 'pending',
            'gateway'           => 'paystack',
            'gateway_reference' => $response['data']['reference'],
        ]);

        return response()->json([
            'access_code'          => $response['data']['access_code'],
            'reference'            => $response['data']['reference'],
            'authorization_url'    => $response['data']['authorization_url'],
        ]);
    }

    public function webhook(Request $request)
    {
        $paystackSignature = $request->header('x-paystack-signature');
        $computedHash = hash_hmac(
            'sha512',
            $request->getContent(),
            config('paystack.secretKey')
        );

        if (!$paystackSignature || !hash_equals($computedHash, $paystackSignature)) {
            Log::warning('Paystack webhook: invalid signature');
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $payload = $request->all();
        $event   = $payload['event'] ?? null;

        Log::info('Paystack webhook received: ' . $event);

        if ($event === 'charge.success') {
            $data      = $payload['data'];
            $reference = $data['reference'];
            $metadata  = $data['metadata'] ?? [];
            $invoiceId = $metadata['invoice_id'] ?? null;

            if (!$invoiceId) {
                Log::error('Paystack webhook: no invoice_id in metadata');
                return response()->json(['message' => 'OK'], 200);
            }

            DB::transaction(function () use ($data, $reference, $invoiceId) {
                $invoice = Invoice::find($invoiceId);

                if (!$invoice || $invoice->status === 'paid') {
                    return;
                }

                // The amount Paystack actually confirmed, not the invoice
                // total — matters once amount_paid can already be nonzero
                // from an earlier partial cash payment.
                $amount = round(($data['amount'] ?? 0) / 100, 2)
                    ?: (float) $invoice->total_amount;

                $payment = Payment::where('gateway_reference', $reference)->first();

                if ($payment) {
                    $payment->update([
                        'status'           => 'successful',
                        'amount'           => $amount,
                        'payment_method'   => $data['channel'] ?? 'card',
                        'gateway_response' => $data,
                        'paid_at'          => now(),
                    ]);
                } else {
                    $payment = Payment::create([
                        'invoice_id'        => $invoiceId,
                        'patient_id'        => $invoice->patient_id,
                        'amount'            => $amount,
                        'currency'          => 'NGN',
                        'status'            => 'successful',
                        'gateway'           => 'paystack',
                        'gateway_reference' => $reference,
                        'gateway_response'  => $data,
                        'payment_method'    => $data['channel'] ?? 'card',
                        'paid_at'           => now(),
                    ]);
                }

                $newAmountPaid = round((float) $invoice->amount_paid + $amount, 2);
                $isFullyPaid   = $newAmountPaid >= (float) $invoice->total_amount - 0.01;

                $invoice->update([
                    'amount_paid' => $newAmountPaid,
                    'status'      => $isFullyPaid ? 'paid' : 'partially_paid',
                    'paid_at'     => $isFullyPaid ? now() : $invoice->paid_at,
                ]);

                // Generate a receipt for this payment specifically.
                Receipt::create([
                    'receipt_number' => Receipt::generateReceiptNumber(),
                    'payment_id'     => $payment->id,
                    'invoice_id'     => $invoice->id,
                    'patient_id'     => $invoice->patient_id,
                    'amount_paid'    => $amount,
                    'currency'       => 'NGN',
                    'payment_method' => $data['channel'] ?? 'card',
                    'issued_at'      => now(),
                ]);

                Log::info("Invoice #{$invoice->invoice_number} payment of {$amount} recorded via Paystack (status: {$invoice->status}).");
            });
        }

        return response()->json(['message' => 'OK'], 200);
    }

    public function verifyPayment($reference)
    {
        $response = $this->callPaystack('GET', '/transaction/verify/' . $reference);

        if (!$response || !$response['status']) {
            return response()->json(['verified' => false, 'message' => 'Verification failed'], 400);
        }

        $status = $response['data']['status']; 

        return response()->json([
            'verified' => $status === 'success',
            'status'   => $status,
            'data'     => $response['data'],
        ]);
    }

    private function callPaystack(string $method, string $endpoint, array $body = []): ?array
    {
        $secretKey = config('paystack.secretKey');
        $baseUrl   = 'https://api.paystack.co';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $secretKey,
            'Content-Type: application/json',
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        $result = curl_exec($ch);
        curl_close($ch);

        return $result ? json_decode($result, true) : null;
    }

    private function generateReference(int $invoiceId): string
    {
        return 'A4C-' . $invoiceId . '-' . strtoupper(uniqid());
    }
}
