<?php

namespace App\Observers;

use App\Models\VisitRecord;
use App\Models\SystemLog;

class VisitRecordObserver
{
    public function created(VisitRecord $record): void
    {
        SystemLog::log(
            'visit_record.created',
            auth('api')->user()?->name . ' added a visit record for patient file #' . $record->patient_file_id,
            $record
        );
    }

    public function updated(VisitRecord $record): void
    {
        SystemLog::log(
            'visit_record.updated',
            auth('api')->user()?->name . ' edited visit record #' . $record->id . ' for patient file #' . $record->patient_file_id,
            $record
        );
    }

    public function deleted(VisitRecord $record): void
    {
        SystemLog::log(
            'visit_record.deleted',
            auth('api')->user()?->name . ' deleted visit record #' . $record->id,
            $record
        );
    }
}
