<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class DoctorMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Checking if user is authenticated AND is a doctor
        if (auth('api')->check() && auth('api')->user()->role === 'doctor') {
            return $next($request);
        }

        return response()->json(['error' => 'Unauthorized. Doctor access only.'], 403);
    }
}
