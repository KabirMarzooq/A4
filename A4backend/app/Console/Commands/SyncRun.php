<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SyncRun extends Command
{
    protected $signature   = 'sync:run';
    protected $description = 'Run a full sync cycle: pull new requests, then push status updates';

    public function handle()
    {
        $this->call('sync:pull');
        $this->call('sync:push');
    }
}
