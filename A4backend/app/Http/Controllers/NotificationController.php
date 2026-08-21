<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Appointment;
use App\Models\Prescription;
use App\Models\User;
use App\Models\NotificationRead;

class NotificationController extends Controller
{
    public function summary()
    {
        $user = Auth::user();
        $role = strtolower($user->role);
        $fallback = $user->last_login_at ?? now()->subDay();

        // Per-section read state, persisted via POST /notifications/seen —
        // falls back to last_login_at for any section never explicitly
        // acknowledged, same as before this table existed.
        $reads = NotificationRead::where('user_id', $user->id)
            ->pluck('last_seen_at', 'section_key');
        $since = fn(string $key) => $reads[$key] ?? $fallback;

        $summary = match ($role) {
            'doctor' => [
                'schedule'        => Appointment::where('doctor_id', $user->id)
                    ->where('status', 'pending')
                    ->where('updated_at', '>=', $since('schedule'))
                    ->exists(),
                'all-bills-and-receipts' => \App\Models\Invoice::where('status', 'unpaid')
                    ->exists(),
                'all-appointments' => Appointment::where('created_at', '>=', $since('all-appointments'))->exists(),
                'report-requests' => \App\Models\MedicalReportRequest::where('status', 'pending')
                    ->where('created_at', '>=', $since('report-requests'))
                    ->exists(),
                'medical-records' => \App\Models\PatientFileTransfer::where('to_doctor_id', $user->id)
                    ->where('created_at', '>=', $since('medical-records'))
                    ->exists(),
            ],

            'patient' => [
                'my-appointments' => Appointment::where('patient_id', $user->id)
                    ->whereIn('status', ['confirmed', 'cancelled'])
                    ->where('updated_at', '>=', $since('my-appointments'))
                    ->exists(),
                'my-prescriptions' => Prescription::where('patient_id', $user->id)
                    ->where('created_at', '>=', $since('my-prescriptions'))
                    ->exists(),
                'bills-and-receipts' => \App\Models\Invoice::where('patient_id', $user->id)
                    ->where('status', 'unpaid')
                    ->exists(),
            ],

            'admin' => [
                'all-appointments' => Appointment::where('created_at', '>=', $since('all-appointments'))->exists(),
                'report-requests' => \App\Models\MedicalReportRequest::where('status', 'pending')
                    ->where('created_at', '>=', $since('report-requests'))
                    ->exists(),
                'all-bills-and-receipts' => \App\Models\Invoice::where('status', 'unpaid')
                    ->exists(),
                'users' => User::where('status', 'pending')
                    ->where('created_at', '>=', $since('users'))
                    ->exists(),
                'medical-records' => \App\Models\PatientFileTransfer::where('created_at', '>=', $since('medical-records'))
                    ->exists(),
            ],

            'receptionist' => [
                'all-appointments'  => Appointment::where('created_at', '>=', $since('all-appointments'))->exists(),
                'all-prescriptions' => Prescription::where('created_at', '>=', $since('all-prescriptions'))->exists(),
                'all-bills-and-receipts' => \App\Models\Invoice::where('status', 'unpaid')
                    ->exists(),
            ],

            'pharmacy' => [
                'all-prescriptions' => Prescription::where('created_at', '>=', $since('all-prescriptions'))->exists(),
            ],

            default => [],
        };

        return response()->json($summary);
    }

    /**
     * Persist that the logged-in user has just looked at a section — the
     * dot for it stays cleared past the next 30s poll instead of
     * re-lighting (see summary() above).
     */
    public function markSeen(Request $request)
    {
        $request->validate([
            'section_key' => 'required|string|max:100',
        ]);

        NotificationRead::updateOrCreate(
            ['user_id' => Auth::id(), 'section_key' => $request->section_key],
            ['last_seen_at' => now()]
        );

        return response()->json(['message' => 'ok']);
    }
}
