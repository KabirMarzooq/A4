<?php

namespace App\Console\Commands;

use App\Models\SyncedBookingRequest;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SyncPullAppointments extends Command
{
    protected $signature   = 'sync:pull';
    protected $description = 'Pull new pending online appointments down from the cloud server';

    public function handle()
    {
        $cloudUrl = config('services.sync.cloud_url');
        $secret   = config('services.sync.secret');

        if (!$cloudUrl) {
            $this->error('SYNC_CLOUD_URL is not set — this command only runs on the local server.');
            return;
        }

        try {
            $response = Http::withHeaders(['X-Sync-Key' => $secret])
                ->timeout(10)
                ->get("{$cloudUrl}/api/sync/pending-appointments");
        } catch (\Exception $e) {
            // No internet, or cloud unreachable — this is expected sometimes.
            // Fail quietly; local operations aren't affected either way.
            $this->error('Could not reach cloud server: ' . $e->getMessage());
            return;
        }

        if (!$response->successful()) {
            $this->error('Cloud server returned an error: ' . $response->status());
            return;
        }

        $items = $response->json();

        foreach ($items as $item) {
            SyncedBookingRequest::updateOrCreate(
                ['cloud_appointment_id' => $item['cloud_appointment_id']],
                [
                    'patient_name'          => $item['patient_name'],
                    'patient_phone'         => $item['patient_phone'],
                    'patient_email'         => $item['patient_email'],
                    'requested_doctor_name' => $item['requested_doctor_name'],
                    'appointment_date'      => $item['appointment_date'],
                    'appointment_time'      => $item['appointment_time'],
                    'reason'                => $item['reason'],
                    'pulled_at'             => now(),
                ]
            );
        }

        $this->info(count($items) . ' new request(s) pulled from cloud.');
    }
}
