<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Runs on every API request (registered globally in bootstrap/app.php, not
// per-route like RoleMiddleware) so a deactivated account is locked out of
// a session already in progress, not just blocked at its next login —
// approve()/updateRole()/destroy() in AdminUserController only ever touched
// the database, never the JWT itself.
class EnsureUserActive
{
    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $user = auth('api')->user();

        // No-op for guest routes (login/register/etc — no token presented)
        // and for an unresolvable token (expired/invalid) — RoleMiddleware
        // and the underlying auth guard already reject those on their own.
        if ($user && $user->status !== 'approved') {
            return response()->json(['error' => 'Your account is no longer active.'], 401);
        }

        return $next($request);
    }
}
