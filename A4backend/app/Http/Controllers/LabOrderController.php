<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\LabOrder;
use App\Models\PatientFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class LabOrderController extends Controller
{
    /**
     * Pending/in-progress worklist — the main lab dashboard queue.
     */
    public function index()
    {
        $orders = LabOrder::whereIn('status', ['pending', 'in_progress'])
            ->with(['patientFile.folder', 'orderedBy:id,name'])
            ->orderBy('created_at')
            ->get();

        return response()->json($orders);
    }

    /**
     * Completed orders, most recent first, optionally searched.
     */
    public function history(Request $request)
    {
        $search = $request->query('search');

        $orders = LabOrder::where('status', 'completed')
            ->with(['patientFile.folder', 'orderedBy:id,name', 'labStaff:id,name'])
            ->when($search, function ($q) use ($search) {
                $q->where('test_name', 'like', "%{$search}%")
                    ->orWhereHas('patientFile', function ($q2) use ($search) {
                        $q2->where('first_name', 'like', "%{$search}%")
                           ->orWhere('last_name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('completed_at', 'desc')
            ->paginate(20);

        return response()->json($orders);
    }

    /**
     * All lab orders for a specific patient file.
     */
    public function patientOrders($fileId)
    {
        $orders = LabOrder::where('patient_file_id', $fileId)
            ->with(['orderedBy:id,name', 'labStaff:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Create one or more test orders in a batch — used both when a doctor
     * orders tests for a patient they're seeing, and when lab staff start
     * an order directly for a walk-in. One invoice covers the whole batch;
     * each test gets its own row so they can progress independently.
     */
    public function store(Request $request, $fileId)
    {
        $file = PatientFile::findOrFail($fileId);

        $request->validate([
            'is_doctor_order'      => 'nullable|boolean',
            'visit_record_id'      => 'nullable|exists:visit_records,id',
            'tests'                => 'required|array|min:1',
            'tests.*.lab_test_id'  => 'nullable|exists:lab_tests,id',
            'tests.*.test_name'    => 'required|string|max:150',
            'tests.*.price'        => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request, $fileId, $file) {
            $subtotal = collect($request->tests)->sum('price');

            $invoice = Invoice::create([
                'invoice_number'  => Invoice::generateInvoiceNumber(),
                'patient_file_id' => $fileId,
                'doctor_id'       => $request->boolean('is_doctor_order') ? Auth::id() : null,
                'type'            => 'lab_test',
                'subtotal'        => $subtotal,
                'service_charge'  => 0,
                'total_amount'    => $subtotal,
                'currency'        => 'NGN',
                'status'          => 'unpaid',
                'due_date'        => now()->addDays(1),
            ]);

            $orders = [];
            foreach ($request->tests as $test) {
                InvoiceItem::create([
                    'invoice_id'  => $invoice->id,
                    'description' => $test['test_name'],
                    'quantity'    => 1,
                    'unit_price'  => $test['price'],
                    'total_price' => $test['price'],
                ]);

                $orders[] = LabOrder::create([
                    'patient_file_id' => $fileId,
                    'visit_record_id' => $request->visit_record_id,
                    'lab_test_id'     => $test['lab_test_id'] ?? null,
                    'test_name'       => $test['test_name'],
                    'price'           => $test['price'],
                    // Not inferred from Auth::user()->role — an admin
                    // ordering while switched into "Doctor" view still has
                    // role=admin on the JWT, so this must come from an
                    // explicit flag set by the calling frontend form instead.
                    'ordered_by'      => $request->boolean('is_doctor_order') ? Auth::id() : null,
                    'invoice_id'      => $invoice->id,
                    'status'          => 'pending',
                ]);
            }

            return response()->json([
                'orders'  => $orders,
                'invoice' => $invoice,
            ], 201);
        });
    }

    public function show($id)
    {
        $order = LabOrder::with([
            'patientFile.folder',
            'orderedBy:id,name',
            'labStaff:id,name',
            'invoice',
        ])->findOrFail($id);

        return response()->json($order);
    }

    public function markInProgress($id)
    {
        $order = LabOrder::findOrFail($id);
        $order->update(['status' => 'in_progress']);

        return response()->json($order);
    }

    /**
     * Record the result — file upload and/or typed summary — and mark completed.
     */
    public function uploadResult(Request $request, $id)
    {
        $order = LabOrder::findOrFail($id);

        $request->validate([
            'result_summary' => 'nullable|string',
            'result_file'    => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png',
        ]);

        if (!$request->filled('result_summary') && !$request->hasFile('result_file')) {
            return response()->json([
                'message' => 'Provide a result summary, a file, or both.',
            ], 422);
        }

        $updates = [
            'status'       => 'completed',
            'lab_staff_id' => Auth::id(),
            'completed_at' => now(),
        ];

        if ($request->filled('result_summary')) {
            $updates['result_summary'] = $request->result_summary;
        }

        if ($request->hasFile('result_file')) {
            $path = $request->file('result_file')->store('lab-results', 'public');
            $updates['result_file_path'] = $path;
            $updates['result_file_name'] = $request->file('result_file')->getClientOriginalName();
        }

        $order->update($updates);

        return response()->json($order);
    }

    /**
     * Email the result to the patient. Falls back to accepting an email in
     * the request if the patient file has none on record yet, and saves it
     * back to the file for next time.
     */
    public function sendResult(Request $request, $id)
    {
        $order = LabOrder::with('patientFile')->findOrFail($id);

        if ($order->status !== 'completed') {
            return response()->json(['message' => 'Result is not ready to send yet.'], 422);
        }

        $request->validate([
            'email' => 'nullable|email',
        ]);

        $email = $request->email ?: $order->patientFile->email;

        if (!$email) {
            return response()->json([
                'message' => 'No email on file for this patient. Provide one to send.',
            ], 422);
        }

        if ($request->filled('email') && $request->email !== $order->patientFile->email) {
            $order->patientFile->update(['email' => $request->email]);
        }

        Mail::send('emails.lab-result', ['order' => $order], function ($message) use ($email, $order) {
            $message->to($email)->subject('Your Lab Result — ' . $order->test_name);

            if ($order->result_file_path) {
                $message->attach(Storage::disk('public')->path($order->result_file_path), [
                    'as' => $order->result_file_name ?? 'lab-result.pdf',
                ]);
            }
        });

        $order->update([
            'sent_at'       => now(),
            'sent_to_email' => $email,
        ]);

        return response()->json(['message' => 'Result sent to ' . $email . '.']);
    }
}
