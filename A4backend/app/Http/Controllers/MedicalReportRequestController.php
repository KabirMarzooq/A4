<?php

namespace App\Http\Controllers;

use App\Models\MedicalReportRequest;
use App\Models\MedicalRecord;
use App\Models\PatientProfile;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MedicalReportRequestController extends Controller
{
    /**
     * Patient submits a new report request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date_from' => 'required|date',
            'date_to'   => 'required|date|after_or_equal:date_from',
            'reason'    => 'required|string|max:500',
        ]);

        // Prevent duplicate pending requests
        $existing = MedicalReportRequest::where('patient_id', Auth::id())
            ->where('status', 'pending')
            ->exists();

        if ($existing) {
            return response()->json([
                'message' => 'You already have a pending request. Please wait for it to be reviewed.'
            ], 409);
        }

        $reportRequest = MedicalReportRequest::create([
            'patient_id' => Auth::id(),
            'date_from'  => $validated['date_from'],
            'date_to'    => $validated['date_to'],
            'reason'     => $validated['reason'],
            'status'     => 'pending',
        ]);

        return response()->json($reportRequest, 201);
    }

    /**
     * Patient fetches all their own requests (history).
     */
    public function myRequests()
    {
        $requests = MedicalReportRequest::where('patient_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }

    /**
     * Patient fetches the full report data for an approved request.
     * This assembles the complete report: profile + records + prescriptions.
     */
    public function getReport($requestId)
    {
        $patientId = Auth::id();

        $reportRequest = MedicalReportRequest::where('id', $requestId)
            ->where('patient_id', $patientId)
            ->where('status', 'approved')
            ->firstOrFail();

        $patient = User::where('id', $patientId)
            ->with('patientProfile')
            ->firstOrFail();

        $records = MedicalRecord::where('patient_id', $patientId)
            ->whereBetween('visit_date', [$reportRequest->date_from, $reportRequest->date_to])
            ->with('doctor:id,name,specialization')
            ->orderBy('visit_date', 'desc')
            ->get();

        $prescriptions = Prescription::where('patient_id', $patientId)
            ->whereBetween('created_at', [
                $reportRequest->date_from,
                $reportRequest->date_to . ' 23:59:59'
            ])
            ->with('doctor:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'request'       => $reportRequest,
            'patient'       => [
                'id'      => $patient->id,
                'name'    => $patient->name,
                'email'   => $patient->email,
                'profile' => $patient->patientProfile,
            ],
            'records'       => $records,
            'prescriptions' => $prescriptions,
        ]);
    }
}
