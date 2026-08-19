<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifySyncKey
{
    /**
     * The sync endpoints have no logged-in user — it's the local server
     * calling the cloud server machine-to-machine. A shared secret in
     * .env (SYNC_SECRET) stands in for normal auth here. hash_equals()
     * (not ===) avoids leaking the secret's length/prefix via timing.
     */
    public function handle(Request $request, Closure $next)
    {
        $key    = (string) $request->header('X-Sync-Key', '');
        $secret = (string) config('services.sync.secret', '');

        if ($secret === '' || !hash_equals($secret, $key)) {
            return response()->json(['message' => 'Invalid or missing sync key.'], 401);
        }

        return $next($request);
    }
}
