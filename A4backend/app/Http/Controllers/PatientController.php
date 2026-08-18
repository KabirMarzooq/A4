<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Appointment;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $doctorId = $request->user()->id;

        // Only return patients who have had appointments with THIS doctor
        $patients = Appointment::where('doctor_id', $doctorId)
            ->with('patient:id,name')
            ->get()
            ->pluck('patient')
            ->unique('id')
            ->values();

        return response()->json($patients);
    }

    public function allPatients(Request $request)
    {
        $search = $request->query('search');

        $patients = User::where('role', 'patient')
            ->when($search, fn($q) => $q->where('name', 'like', '%' . $search . '%')
                ->orWhere('email', 'like', '%' . $search . '%'))
            ->select('id', 'name', 'email', 'phone')
            ->orderBy('name')
            ->get();

        return response()->json($patients);
    }
}
