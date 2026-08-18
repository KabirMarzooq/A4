<?php

namespace App\Observers;

use App\Models\PatientFolder;
use App\Models\SystemLog;

class PatientFolderObserver
{
    public function created(PatientFolder $folder): void
    {
        SystemLog::log(
            'patient_folder.created',
            auth('api')->user()?->name . ' created new patient folder: ' . $folder->folder_name . ' (Phone: ' . $folder->phone . ')',
            $folder
        );
    }

    public function updated(PatientFolder $folder): void
    {
        SystemLog::log(
            'patient_folder.updated',
            auth('api')->user()?->name . ' updated folder: ' . $folder->folder_name,
            $folder
        );
    }

    public function deleted(PatientFolder $folder): void
    {
        SystemLog::log(
            'patient_folder.deleted',
            auth('api')->user()?->name . ' deleted folder: ' . $folder->folder_name . ' (Phone: ' . $folder->phone . ')',
            $folder
        );
    }
}
