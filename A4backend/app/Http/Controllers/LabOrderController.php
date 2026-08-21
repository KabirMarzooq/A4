<?php

namespace App\Http\Controllers;

use App\Models\LabOrder;
use App\Models\PatientFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
     * an order directly for a walk-in with an existing file. No invoice or
     * price here any more — lab orders a test, reception bills it
     * separately (ReceptionBillingController::storeInvoice). The lab_tests
     * catalog price still exists as reception's future pricing reference.
     */
    public function store(Request $request, $fileId)
    {
        PatientFile::findOrFail($fileId);

        $request->validate([
            'is_doctor_order'      => 'nullable|boolean',
            'visit_record_id'      => 'nullable|exists:visit_records,id',
            'tests'                => 'required|array|min:1',
            'tests.*.lab_test_id'  => 'nullable|exists:lab_tests,id',
            'tests.*.test_name'    => 'required|string|max:150',
        ]);

        $orders = collect($request->tests)->map(fn($test) => LabOrder::create([
            'patient_file_id' => $fileId,
            'visit_record_id' => $request->visit_record_id,
            'lab_test_id'     => $test['lab_test_id'] ?? null,
            'test_name'       => $test['test_name'],
            // Not inferred from Auth::user()->role — an admin ordering
            // while switched into "Doctor" view still has role=admin on
            // the JWT, so this must come from an explicit flag set by the
            // calling frontend form instead.
            'ordered_by'      => $request->boolean('is_doctor_order') ? Auth::id() : null,
            'status'          => 'pending',
        ]));

        return response()->json(['orders' => $orders], 201);
    }

    /**
     * Same as store(), but for a walk-in with no patient file at all — lab
     * staff shouldn't have to create a full folder+file just to run one
     * test for someone who isn't otherwise a patient here.
     */
    public function storeStandalone(Request $request)
    {
        $request->validate([
            'patient_name'         => 'required|string|max:150',
            'patient_email'        => 'nullable|email|max:150',
            'patient_phone'        => 'nullable|string|max:20',
            'tests'                => 'required|array|min:1',
            'tests.*.lab_test_id'  => 'nullable|exists:lab_tests,id',
            'tests.*.test_name'    => 'required|string|max:150',
        ]);

        $orders = collect($request->tests)->map(fn($test) => LabOrder::create([
            'patient_name'  => $request->patient_name,
            'patient_email' => $request->patient_email,
            'patient_phone' => $request->patient_phone,
            'lab_test_id'   => $test['lab_test_id'] ?? null,
            'test_name'     => $test['test_name'],
            'status'        => 'pending',
        ]));

        return response()->json(['orders' => $orders], 201);
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
     * the request if there's none on record yet (patient file, or the
     * order's own snapshot email for a standalone walk-in), and saves it
     * back for next time.
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

        $onFileEmail = $order->patientFile?->email ?? $order->patient_email;
        $email = $request->email ?: $onFileEmail;

        if (!$email) {
            return response()->json([
                'message' => 'No email on file for this patient. Provide one to send.',
            ], 422);
        }

        if ($request->filled('email') && $request->email !== $onFileEmail) {
            if ($order->patientFile) {
                $order->patientFile->update(['email' => $request->email]);
            } else {
                $order->update(['patient_email' => $request->email]);
            }
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
