<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = auth('api')->user();

        // Checking if user is logged in AND if their role is in the allowed list
        if (!$user || !in_array($user->role, $roles)) {
            return response()->json(['error' => 'Unauthorized. Only ' . implode(' or ', $roles) . ' allowed.'], 403);
        }

        return $next($request);
    }
}
