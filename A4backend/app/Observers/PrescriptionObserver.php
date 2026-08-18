<?php
// app/Observers/PrescriptionObserver.php

namespace App\Observers;

use App\Models\Prescription;
use App\Models\SystemLog;

class PrescriptionObserver
{
    public function created(Prescription $prescription): void
    {
        SystemLog::log(
            'prescription.created',
            auth('api')->user()?->name . ' issued a prescription for patient #' . $prescription->patient_id,
            $prescription
        );
    }

    public function updated(Prescription $prescription): void
    {
        SystemLog::log(
            'prescription.updated',
            auth('api')->user()?->name . ' updated prescription #' . $prescription->id,
            $prescription
        );
    }
}
