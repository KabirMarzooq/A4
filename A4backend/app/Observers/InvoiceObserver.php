<?php

namespace App\Observers;

use App\Models\Invoice;
use App\Models\SystemLog;

class InvoiceObserver
{
    public function created(Invoice $invoice): void
    {
        SystemLog::log(
            'billing.invoice_generated',
            'Invoice ' . $invoice->invoice_number . ' generated for ₦' . number_format($invoice->total_amount, 2) . ' (Type: ' . $invoice->type . ')',
            $invoice
        );
    }

    public function updated(Invoice $invoice): void
    {
        if ($invoice->wasChanged('status')) {
            $old = $invoice->getOriginal('status');
            $new = $invoice->status;
            SystemLog::log(
                'billing.invoice_' . $new,
                auth('api')->user()?->name . ' marked invoice ' . $invoice->invoice_number . ' as ' . strtoupper($new) . ' (was: ' . $old . ')',
                $invoice
            );
        }
    }
}
