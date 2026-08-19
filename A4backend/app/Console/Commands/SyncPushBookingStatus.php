<?php

namespace App\Console\Commands;

use App\Models\SyncedBookingRequest;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SyncPushBookingStatus extends Command
{
    protected $signature   = 'sync:push';
    protected $description = 'Push local confirm/decline decisions back up to the cloud server';

    public function handle()
    {
        $cloudUrl = config('services.sync.cloud_url');
        $secret   = config('services.sync.secret');

        if (!$cloudUrl) {
            $this->error('SYNC_CLOUD_URL is not set — this command only runs on the local server.');
            return;
        }

        $unpushed = SyncedBookingRequest::whereNull('status_pushed_at')
            ->whereIn('status', ['confirmed', 'declined'])
            ->get();

        foreach ($unpushed as $r) {
            try {
                $response = Http::withHeaders(['X-Sync-Key' => $secret])
                    ->timeout(10)
                    ->post("{$cloudUrl}/api/sync/status-update", [
                        'cloud_appointment_id' => $r->cloud_appointment_id,
                        'status'               => $r->status === 'confirmed' ? 'confirmed' : 'cancelled',
                        'decline_reason'       => $r->decline_reason,
                    ]);

                if ($response->successful()) {
                    $r->update(['status_pushed_at' => now()]);
                }
            } catch (\Exception $e) {
                // Will retry automatically next run — no internet right now.
                $this->error("Could not push request #{$r->id} yet: " . $e->getMessage());
            }
        }

        $this->info($unpushed->count() . ' status update(s) processed.');
    }
}
