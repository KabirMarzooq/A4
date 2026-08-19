<?php

namespace App\Observers;

use App\Models\LabOrder;
use App\Models\SystemLog;

class LabOrderObserver
{
    public function created(LabOrder $order): void
    {
        SystemLog::log(
            'lab.order_created',
            auth('api')->user()?->name . ' ordered ' . $order->test_name . ' for patient file #' . $order->patient_file_id,
            $order
        );
    }

    public function updated(LabOrder $order): void
    {
        if ($order->wasChanged('status') && $order->status === 'completed') {
            SystemLog::log(
                'lab.result_recorded',
                auth('api')->user()?->name . ' recorded a result for ' . $order->test_name . ' (order #' . $order->id . ')',
                $order
            );
        }

        if ($order->wasChanged('sent_at') && $order->sent_at) {
            SystemLog::log(
                'lab.result_sent',
                auth('api')->user()?->name . ' sent the result for ' . $order->test_name . ' to ' . $order->sent_to_email,
                $order
            );
        }
    }
}
