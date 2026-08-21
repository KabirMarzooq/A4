<?php

namespace App\Http\Controllers;

use App\Models\MedicalReportRequest;
use App\Models\PatientFile;
use App\Models\Prescription;
use App\Models\User;
use App\Models\VisitRecord;
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
     * Assembled from the real clinical data model — PatientFile/VisitRecord
     * via whichever files this account has linked (RecordClaimController) —
     * not the legacy MedicalRecord/PatientProfile tables this used to read,
     * which nothing in the app ever wrote to and didn't even exist as
     * tables in the database, so every "approved" report used to 500.
     */
    public function getReport($requestId)
    {
        $patientId = Auth::id();

        $reportRequest = MedicalReportRequest::where('id', $requestId)
            ->where('patient_id', $patientId)
            ->where('status', 'approved')
            ->firstOrFail();

        $patient = User::findOrFail($patientId);

        $linkedFiles = PatientFile::where('linked_user_id', $patientId)->get();
        $linkedFileIds = $linkedFiles->pluck('id');
        // Demographics/allergies come from the first linked file — most
        // patients only ever link one. Visit records and prescriptions
        // below combine across every linked file, so a patient who somehow
        // ended up with more than one still sees everything.
        $primaryFile = $linkedFiles->first();

        $records = VisitRecord::whereIn('patient_file_id', $linkedFileIds)
            ->whereBetween('visit_date', [$reportRequest->date_from, $reportRequest->date_to])
            ->with('doctor:id,name,specialization')
            ->orderBy('visit_date', 'desc')
            ->get();

        // Prescriptions written against the patient's online account
        // directly, or against any hospital file they've linked.
        $prescriptions = Prescription::where(function ($q) use ($patientId, $linkedFileIds) {
                $q->where('patient_id', $patientId)
                    ->orWhereIn('patient_file_id', $linkedFileIds);
            })
            ->whereBetween('created_at', [
                $reportRequest->date_from,
                $reportRequest->date_to . ' 23:59:59'
            ])
            ->with('doctor:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'request'           => $reportRequest,
            'patient'           => [
                'id'    => $patient->id,
                'name'  => $patient->name,
                'email' => $patient->email,
                'profile' => $primaryFile ? [
                    'blood_type'         => $primaryFile->blood_type,
                    'gender'             => $primaryFile->gender,
                    'date_of_birth'      => $primaryFile->date_of_birth,
                    'height_cm'          => $primaryFile->height_cm,
                    'weight_kg'          => $primaryFile->weight_kg,
                    'allergies'          => $primaryFile->allergies,
                    'chronic_conditions' => $primaryFile->chronic_conditions,
                ] : null,
            ],
            'records'           => $records,
            'prescriptions'     => $prescriptions,
            'has_linked_record' => $linkedFileIds->isNotEmpty(),
        ]);
    }
}
