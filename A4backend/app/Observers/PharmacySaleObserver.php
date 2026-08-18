<?php

namespace App\Observers;

use App\Models\PharmacySale;
use App\Models\SystemLog;

class PharmacySaleObserver
{
    public function created(PharmacySale $sale): void
    {
        SystemLog::log(
            'sales.session_opened',
            auth('api')->user()?->name . ' opened daily sales session for ' . $sale->sale_date,
            $sale
        );
    }

    public function updated(PharmacySale $sale): void
    {
        if ($sale->wasChanged('status') && $sale->status === 'closed') {
            SystemLog::log(
                'sales.session_closed',
                auth('api')->user()?->name . ' closed sales for ' . $sale->sale_date . ' — Total: ₦' . number_format($sale->total_amount, 2),
                $sale
            );
        } elseif ($sale->wasChanged('total_amount')) {
            SystemLog::log(
                'sales.total_updated',
                'Sales total for ' . $sale->sale_date . ' updated to ₦' . number_format($sale->total_amount, 2),
                $sale
            );
        }
    }
}
