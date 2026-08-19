<?php

namespace App\Observers;

use App\Models\SyncedBookingRequest;
use App\Models\SystemLog;

class SyncedBookingRequestObserver
{
    public function updated(SyncedBookingRequest $request): void
    {
        if (!$request->wasChanged('status')) {
            return;
        }

        if ($request->status === 'confirmed') {
            SystemLog::log(
                'sync.request_confirmed',
                auth('api')->user()?->name . ' confirmed an online booking request for ' . $request->patient_name,
                $request
            );
        }

        if ($request->status === 'declined') {
            SystemLog::log(
                'sync.request_declined',
                auth('api')->user()?->name . ' declined an online booking request for ' . $request->patient_name,
                $request
            );
        }
    }
}
