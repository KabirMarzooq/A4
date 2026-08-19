<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    // ->withMiddleware(function (Middleware $middleware): void {
    //     //
    // })
    ->withMiddleware(function (Middleware $middleware) {
        // Add CORS to API routes
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Blanket rate limit (60/min per authenticated user, else per IP) on
        // every API route as defense-in-depth, on top of the tighter named
        // limiters already applied to specific sensitive routes (login,
        // register, forgot-password, etc. — see AppServiceProvider).
        $middleware->throttleApi();

        // Add Role Middleware
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'doctor' => \App\Http\Middleware\DoctorMiddleware::class,
            'sync.key' => \App\Http\Middleware\VerifySyncKey::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
