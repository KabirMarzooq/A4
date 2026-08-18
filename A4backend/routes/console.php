<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\PharmacySale;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-close pharmacy sales at 10pm every day
Schedule::call(function () {
    $today = now()->format('Y-m-d');
    $sale  = PharmacySale::where('sale_date', $today)
        ->where('status', 'open')
        ->first();

    if ($sale) {
        $sale->update([
            'status'    => 'closed',
            'closed_at' => now()->setTime(22, 0, 0)->toDateTimeString(),
        ]);
    }
})->dailyAt('22:00')->name('close-pharmacy-sale')->withoutOverlapping();
