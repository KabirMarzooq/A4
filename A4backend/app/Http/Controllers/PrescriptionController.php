<?php

// app/Http/Controllers/PrescriptionController.php

namespace App\Http\Controllers;

use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PrescriptionController extends Controller
{
    // Fetch prescriptions written by the logged-in doctor
    public function index()
    {
        return Prescription::with(['patient:id,name', 'items', 'patientFile'])
            ->where('doctor_id', Auth::id())
            ->latest()
            ->get();
    }

    // Save a new prescription
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'      => 'nullable|exists:users,id',
            'patient_file_id' => 'nullable|exists:patient_files,id',
            'instructions'        => 'nullable|string',
            'drugs'               => 'required|array|min:1',
            'drugs.*.drug_id'     => 'required|exists:drugs,id',
            'drugs.*.drug_name'   => 'required|string',
            'drugs.*.quantity'    => 'required|integer|min:1',
            'drugs.*.unit_price'  => 'required|numeric|min:0',
            'drugs.*.total'       => 'required|numeric|min:0',
            'drugs.*.frequency' => 'nullable|string',
            'drugs.*.duration'  => 'nullable|string',
            'drugs.*.dosage'  => 'nullable|string',
        ]);

        $doctorId = Auth::id();

        // Build a readable medication string for backward compatibility
        $medicationSummary = collect($validated['drugs'])
            ->map(fn($d) => "{$d['drug_name']} x{$d['quantity']}")
            ->join(', ');

        // Wrapped in a transaction so a failure partway through the items
        // loop (e.g. one bad drug row) can't leave an orphaned prescription
        // with zero items — either the whole thing saves or none of it does.
        $prescription = DB::transaction(function () use ($validated, $doctorId, $medicationSummary) {
            $prescription = Prescription::create([
                'doctor_id'    => $doctorId,
                'patient_id'      => $validated['patient_id'] ?? null,
                'patient_file_id' => $validated['patient_file_id'] ?? null,
                'medication'   => $medicationSummary,
                'dosage'       => null,
                'frequency'    => null,
                'duration'     => null,
                'instructions' => $validated['instructions'],
            ]);

            foreach ($validated['drugs'] as $drug) {
                $prescription->items()->create([
                    'drug_id'    => $drug['drug_id'],
                    'drug_name'  => $drug['drug_name'],
                    'quantity'   => $drug['quantity'],
                    'unit_price' => $drug['unit_price'],
                    'total'      => $drug['total'],
                    'frequency'  => $drug['frequency'] ?? null,
                    'duration'   => $drug['duration'] ?? null,
                    'dosage'   => $drug['dosage'] ?? null,
                ]);
            }

            return $prescription;
        });

        return response()->json($prescription->load('items'), 201);
    }

    public function allPrescriptions()
    {
        return Prescription::with(['patient:id,name', 'doctor:id,name', 'items', 'patientFile'])
            ->latest()
            ->paginate(15);
    }
}
