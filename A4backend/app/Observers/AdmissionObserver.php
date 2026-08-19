<?php

namespace App\Observers;

use App\Models\Admission;
use App\Models\SystemLog;

class AdmissionObserver
{
    public function created(Admission $admission): void
    {
        SystemLog::log(
            'admission.created',
            auth('api')->user()?->name . ' admitted patient file #' . $admission->patient_file_id . ' to ward: ' . $admission->ward,
            $admission
        );
    }

    public function updated(Admission $admission): void
    {
        if ($admission->wasChanged('status') && $admission->status === 'discharged') {
            SystemLog::log(
                'admission.discharged',
                auth('api')->user()?->name . ' discharged patient file #' . $admission->patient_file_id . ' from ward: ' . $admission->ward,
                $admission
            );
        }
    }

    public function deleted(Admission $admission): void
    {
        SystemLog::log(
            'admission.deleted',
            auth('api')->user()?->name . ' deleted admission #' . $admission->id,
            $admission
        );
    }
}
