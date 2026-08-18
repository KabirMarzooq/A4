<?php

namespace App\Observers;

use App\Models\PatientFile;
use App\Models\SystemLog;

class PatientFileObserver
{
    public function created(PatientFile $file): void
    {
        SystemLog::log(
            'patient_file.created',
            auth('api')->user()?->name . ' created patient file for ' . $file->first_name . ' ' . $file->last_name . ' in folder #' . $file->patient_folder_id,
            $file
        );
    }

    public function updated(PatientFile $file): void
    {
        SystemLog::log(
            'patient_file.updated',
            auth('api')->user()?->name . ' updated patient file for ' . $file->first_name . ' ' . $file->last_name,
            $file
        );
    }

    public function deleted(PatientFile $file): void
    {
        SystemLog::log(
            'patient_file.deleted',
            auth('api')->user()?->name . ' deleted patient file for ' . $file->first_name . ' ' . $file->last_name,
            $file
        );
    }
}
