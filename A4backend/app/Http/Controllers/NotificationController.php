<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Appointment;
use App\Models\Prescription;
use App\Models\User;

class NotificationController extends Controller
{
    public function summary()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $since = $user->last_login_at ?? now()->subDay(); // anything newer than last login counts as "new"

        $summary = match ($role) {
            'doctor' => [
                'schedule'        => Appointment::where('doctor_id', $user->id)
                    ->where('status', 'pending')
                    ->where('updated_at', '>=', $since)
                    ->exists(),
                'all-bills-and-receipts' => \App\Models\Invoice::where('status', 'unpaid')
                    ->exists(),
                'all-appointments' => Appointment::where('created_at', '>=', $since)->exists(),
                'report-requests' => \App\Models\MedicalReportRequest::where('status', 'pending')
                    ->where('created_at', '>=', $since)
                    ->exists(),
                'medical-records' => \App\Models\PatientFileTransfer::where('to_doctor_id', $user->id)
                    ->where('created_at', '>=', $since)
                    ->exists(),
            ],

            'patient' => [
                'my-appointments' => Appointment::where('patient_id', $user->id)
                    ->whereIn('status', ['confirmed', 'cancelled'])
                    ->where('updated_at', '>=', $since)
                    ->exists(),
                'my-prescriptions' => Prescription::where('patient_id', $user->id)
                    ->where('created_at', '>=', $since)
                    ->exists(),
                'bills-and-receipts' => \App\Models\Invoice::where('patient_id', $user->id)
                    ->where('status', 'unpaid')
                    ->exists(),
            ],

            'admin' => [
                'all-appointments' => Appointment::where('created_at', '>=', $since)->exists(),
                'report-requests' => \App\Models\MedicalReportRequest::where('status', 'pending')
                    ->where('created_at', '>=', $since)
                    ->exists(),
                'all-bills-and-receipts' => \App\Models\Invoice::where('status', 'unpaid')
                    ->exists(),
                'users' => User::where('status', 'pending')
                    ->where('created_at', '>=', $since)
                    ->exists(),
            ],

            'receptionist' => [
                'all-appointments'  => Appointment::where('created_at', '>=', $since)->exists(),
                'all-prescriptions' => Prescription::where('created_at', '>=', $since)->exists(),
                'all-bills-and-receipts' => \App\Models\Invoice::where('status', 'unpaid')
                    ->exists(),
            ],

            'pharmacy' => [
                'all-prescriptions' => Prescription::where('created_at', '>=', $since)->exists(),
            ],

            default => [],
        };

        return response()->json($summary);
    }
}
