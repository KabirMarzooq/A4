<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Appointment;
use App\Http\Controllers\BillingController;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    public function getDoctors()
    {
        // Doctors need admin approval to appear here. Admin accounts are
        // included too — the hospital owner also practises as a doctor —
        // and admin accounts have no approval step, so the status filter
        // only applies to real doctor rows.
        $doctors = User::where(fn($q) => $q
            ->where(fn($d) => $d->where('role', 'doctor')->where('status', 'approved'))
            ->orWhere('role', 'admin'))
            ->select('id', 'name', 'specialization', 'role')
            ->orderByRaw("role = 'admin'") // admin last, real doctors first
            ->orderBy('name')
            ->get();

        return response()->json($doctors);
    }

    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required',
            'reason' => 'required|string',
            'additional_notes' => 'nullable|string'
        ]);

        $conflict = Appointment::where('doctor_id', $request->doctor_id)
            ->where('appointment_date', $request->appointment_date)
            ->where('appointment_time', $request->appointment_time)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Sorry, this time slot is already booked for this doctor.'
            ], 409);
        }

        $appointment = Appointment::create([
            'patient_id' => $request->user()->id, // Gets the ID from the logged-in user's token
            'doctor_id' => $request->doctor_id,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'reason' => $request->reason,
            'additional_notes' => $request->additional_notes,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Appointment booked successfully!',
            'appointment' => $appointment
        ], 201);
    }

    public function myAppointments(Request $request)
    {
        // Get appointments for the logged-in user with doctor details
        $appointments = Appointment::where('patient_id', $request->user()->id)
            ->with('doctor:id,name,specialization')
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->latest()
            ->get();

        return response()->json($appointments);
    }

    public function cancel($id)
    {
        $appointment = Appointment::where('id', $id)
            ->where('patient_id', auth('api')->id())
            ->firstOrFail();

        $appointment->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Appointment cancelled successfully']);
    }

    public function reschedule(Request $request, $id)
    {
        $request->validate([
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required',
        ]);

        $appointment = Appointment::where('id', $id)
            ->where('patient_id', auth('api')->id())
            ->firstOrFail();

        $appointment->update([
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Rescheduled successfully']);
    }

    public function doctorAppointments(Request $request)
    {
        $doctorId = $request->user()->id;

        $appointments = Appointment::where('doctor_id', $doctorId)
            ->with('patient:id,name,email,phone')
            ->whereIn('status', ['pending', 'confirmed'])
            ->orderBy('appointment_date', 'asc')
            ->orderBy('appointment_time', 'asc')
            ->get();

        return response()->json($appointments);
    }


    // Accept an appointment
    public function acceptAppointment($id)
    {
        $appointment = Appointment::where('id', $id)
            ->where('doctor_id', auth('api')->id())
            ->firstOrFail();

        $appointment->update(['status' => 'confirmed']);

        // ── Auto-generate consultation invoice ──────────────────────────────
        // DISABLED: appointments/consultations have no fixed price at this
        // hospital, so accepting an appointment must not create a bill.
        // The doctor writes the actual treatment price down when they fill in
        // the patient's file after seeing them (PatientFolderController::
        // storeVisitRecord/updateVisitRecord) — that's what generates the
        // invoice now. Left here commented in case a fixed-fee model returns.
        // try {
        //     BillingController::generateConsultationInvoice($appointment);
        // } catch (\Exception $e) {
        //     // Log but don't fail the acceptance if billing has an issue
        //     Log::error('Invoice generation failed: ' . $e->getMessage());
        // }

        return response()->json(['message' => 'Appointment confirmed successfully.']);
    }

    // Decline an appointment
    public function declineAppointment(Request $request, $id)
    {
        $request->validate([
            'cancellation_reason' => 'required|string|max:500'
        ]);

        $appointment = Appointment::where('id', $id)
            ->where('doctor_id', auth('api')->id())
            ->firstOrFail();

        $appointment->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->cancellation_reason
        ]);

        return response()->json(['message' => 'Appointment declined.']);
    }
}
