<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\PharmacySale;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Daily database backup (data only — the app itself is already in git, no
// need to re-zip the codebase every night). Retention/pruning rules are in
// config/backup.php under 'cleanup'. Stored on the 'local' disk by default —
// on a container host like Railway that means it's lost on redeploy unless
// a persistent volume is attached, or config/backup.php's disks are pointed
// at S3-compatible storage (AWS_* env vars are already scaffolded for this).
Schedule::command('backup:run --only-db')->daily()->at('02:00')->withoutOverlapping();
Schedule::command('backup:clean')->daily()->at('02:30')->withoutOverlapping();
// Flags it by email if a backup goes missing, stops updating, or shrinks
// unexpectedly — catches "the backup job silently stopped running" in a way
// backup:run succeeding once wouldn't.
Schedule::command('backup:monitor')->daily()->at('03:00')->withoutOverlapping();

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

// Offline sync — pulls new online bookings down, pushes confirm/decline
// decisions back up. Only does anything on the local deployment (SYNC_CLOUD_URL
// set); on the cloud deployment this exits immediately and quietly, since the
// cloud server never needs to call itself. The local machine's own OS-level
// scheduler just needs to run `php artisan schedule:run` every minute — this
// line decides the actual cadence, same as every other job above.
Schedule::command('sync:run')->everyFiveMinutes()->withoutOverlapping();
