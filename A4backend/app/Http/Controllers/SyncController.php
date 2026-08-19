<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    /**
     * CLOUD SIDE — called by the local server's `sync:pull` command.
     * Returns any online appointment not yet pulled, then marks it pulled
     * so it isn't sent down again on the next run.
     */
    public function pendingAppointments()
    {
        $appointments = Appointment::whereNull('pulled_by_local_at')
            ->where('status', 'pending')
            ->with(['patient:id,name,email,phone', 'doctor:id,name,specialization'])
            ->orderBy('created_at')
            ->get();

        $payload = $appointments->map(fn($a) => [
            'cloud_appointment_id'  => $a->id,
            'patient_name'          => $a->patient?->name,
            'patient_phone'         => $a->patient?->phone,
            'patient_email'         => $a->patient?->email,
            'requested_doctor_name' => $a->doctor?->name,
            'appointment_date'      => $a->appointment_date,
            'appointment_time'      => $a->appointment_time,
            'reason'                => $a->reason,
        ]);

        Appointment::whereIn('id', $appointments->pluck('id'))
            ->update(['pulled_by_local_at' => now()]);

        return response()->json($payload);
    }

    /**
     * CLOUD SIDE — called by the local server's `sync:push` command once a
     * receptionist has confirmed/declined a synced request locally.
     */
    public function receiveStatusUpdate(Request $request)
    {
        $request->validate([
            'cloud_appointment_id' => 'required|exists:appointments,id',
            'status'               => 'required|in:confirmed,cancelled',
            'decline_reason'       => 'nullable|string|max:500',
        ]);

        $appointment = Appointment::findOrFail($request->cloud_appointment_id);
        $appointment->update([
            'status'              => $request->status,
            'cancellation_reason' => $request->decline_reason,
        ]);

        return response()->json(['message' => 'Status updated.']);
    }
}
