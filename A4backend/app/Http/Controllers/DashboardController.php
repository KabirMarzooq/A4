<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class DashboardController extends Controller
{

    public function getDoctorDashboard(Request $request)
    {
        $doctor = $request->user();
        $doctorId = $doctor->id;
        $today = now()->format('Y-m-d');

        $stats = [
            'totalPatients' => Appointment::where('doctor_id', $doctorId)
                ->distinct('patient_id')
                ->count('patient_id'),
            'todayCount' => Appointment::where('doctor_id', $doctorId)
                ->where('appointment_date', $today)
                ->count(),
            'pendingCount' => Appointment::where('doctor_id', $doctorId)
                ->where('status', 'pending')
                ->count(),
            'messageCount' => 0,
        ];

        $patients = Appointment::where('doctor_id', $doctorId)
            ->with('patient:id,name')
            ->orderBy('appointment_date', 'desc')
            ->get()
            ->unique('patient_id')
            ->map(function ($apt) {
                return [
                    'id'               => $apt->id,
                    'patient_id'       => $apt->patient_id,
                    'patient_name'     => $apt->patient->name ?? 'Unknown',
                    'appointment_date' => $apt->appointment_date,
                    'appointment_time' => $apt->appointment_time,
                    'reason'           => $apt->reason,
                    'additional_notes' => $apt->additional_notes,
                    'status'           => $apt->status,
                ];
            })->values();

        $appointments = Appointment::where('doctor_id', $doctorId)
            ->where('appointment_date', $today)
            ->with('patient:id,name')
            ->orderBy('appointment_time', 'asc')
            ->get()
            ->map(function ($apt) {
                return [
                    'id'               => $apt->id,
                    'patient_id'       => $apt->patient_id,
                    'patient_name'     => $apt->patient->name ?? 'Unknown',
                    'appointment_date' => $apt->appointment_date,
                    'appointment_time' => $apt->appointment_time,
                    'reason'           => $apt->reason,
                    'status'           => $apt->status,
                ];
            });

        return response()->json([
            'stats'        => $stats,
            'patients'     => $patients,
            'appointments' => $appointments,
        ]);
    }
}
