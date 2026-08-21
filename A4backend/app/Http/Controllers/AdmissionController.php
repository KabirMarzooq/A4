<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\PatientFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdmissionController extends Controller
{
    /**
     * Admit a patient — one active admission per patient file at a time.
     * Billing during the stay is not handled here: doctors bill exactly as
     * they already do via a normal visit record's consultation_fee, which
     * auto-tags itself to this admission (see PatientFolderController::
     * storeVisitRecord).
     */
    public function admit(Request $request, $fileId)
    {
        $file = PatientFile::findOrFail($fileId);

        if ($file->currentAdmission) {
            return response()->json([
                'message' => 'This patient already has an active admission.',
            ], 422);
        }

        $request->validate([
            'ward'                 => 'required|string|max:100',
            'reason_for_admission' => 'nullable|string',
            'admission_date'       => 'nullable|date',
            'admitting_doctor_id'  => 'nullable|exists:users,id',
        ]);

        $admission = Admission::create([
            'patient_file_id'      => $fileId,
            'admitting_doctor_id'  => $request->admitting_doctor_id ?? Auth::id(),
            'ward'                 => $request->ward,
            'reason_for_admission' => $request->reason_for_admission,
            'admission_date'       => $request->admission_date ?? now()->toDateString(),
            'status'               => 'admitted',
            'created_by'           => Auth::id(),
        ]);

        return response()->json($admission->load('admittingDoctor:id,name'), 201);
    }

    /**
     * Hospital-wide admissions list — the ward board.
     *
     * Admissions previously had no home of their own: you could only admit or
     * discharge from inside one patient's file, so "who is currently on the
     * ward" was unanswerable without opening records one by one.
     *
     * ?status=admitted|discharged filters; default returns current stays
     * first, then recent discharges.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $search = $request->query('search');

        $admissions = Admission::with([
            'admittingDoctor:id,name',
            'patientFile:id,patient_folder_id,first_name,last_name',
            'patientFile.folder:id,folder_name,phone',
        ])
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($search, fn($q) => $q->whereHas(
                'patientFile',
                fn($f) => $f->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
            ))
            // Current stays float to the top regardless of date.
            ->orderByRaw("CASE WHEN status = 'admitted' THEN 0 ELSE 1 END")
            ->orderBy('admission_date', 'desc')
            ->paginate(20);

        return response()->json($admissions);
    }

    /**
     * This patient's full admission history (current + past stays).
     */
    public function indexForFile($fileId)
    {
        $admissions = Admission::where('patient_file_id', $fileId)
            ->with('admittingDoctor:id,name')
            ->orderBy('admission_date', 'desc')
            ->get();

        return response()->json($admissions);
    }

    /**
     * Discharge — closes the stay. The accumulated bill (if any) was
     * already generated per-visit exactly as normal, so there's nothing
     * extra to reconcile here.
     */
    public function discharge(Request $request, $admissionId)
    {
        $admission = Admission::findOrFail($admissionId);

        if ($admission->status !== 'admitted') {
            return response()->json([
                'message' => 'This admission is already discharged.',
            ], 422);
        }

        $request->validate([
            'discharge_date'      => 'nullable|date',
            'discharge_summary'   => 'nullable|string',
            'discharge_diagnosis' => 'nullable|string',
        ]);

        $admission->update([
            'status'              => 'discharged',
            'discharge_date'      => $request->discharge_date ?? now()->toDateString(),
            'discharge_summary'   => $request->discharge_summary,
            'discharge_diagnosis' => $request->discharge_diagnosis,
        ]);

        return response()->json($admission->load('admittingDoctor:id,name'));
    }
}
