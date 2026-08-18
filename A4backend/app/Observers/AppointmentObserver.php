<?php
// app/Observers/AppointmentObserver.php


namespace App\Observers;

use App\Models\Appointment;
use App\Models\SystemLog;

class AppointmentObserver
{
    public function created(Appointment $appointment): void
    {
        SystemLog::log(
            'appointment.created',
            auth('api')->user()?->name . ' booked an appointment for patient #' . $appointment->patient_id,
            $appointment
        );
    }

    public function updated(Appointment $appointment): void
    {
        $status = $appointment->status;
        SystemLog::log(
            'appointment.' . $status,
            auth('api')->user()?->name . ' marked appointment #' . $appointment->id . ' as ' . $status,
            $appointment
        );
    }

    public function deleted(Appointment $appointment): void
    {
        SystemLog::log(
            'appointment.deleted',
            auth('api')->user()?->name . ' deleted appointment #' . $appointment->id,
            $appointment
        );
    }
}
