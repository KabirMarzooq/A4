<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PatientPrescriptionController extends Controller
{
    // Fetch prescriptions for the logged-in patient
    public function index()
    {
        $prescriptions = Prescription::with(['doctor:id,name', 'items'])
            ->where('patient_id', Auth::id())
            ->latest()
            ->get();

        return response()->json($prescriptions);
    }

    public function requestRefill(Request $request, $id)
    {
        $prescription = Prescription::where('id', $id)
            ->where('patient_id', Auth::id())
            ->firstOrFail();


        return response()->json([
            'message' => 'Refill request sent to Dr. ' . $prescription->doctor->name
        ]);
    }
}
