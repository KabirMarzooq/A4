<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
// app/Providers/AppServiceProvider.php
use App\Models\Appointment;
use App\Models\User;
use App\Models\Prescription;
use App\Models\VisitRecord;
use App\Models\PatientFile;
use App\Models\PatientFolder;
use App\Models\Drug;
use App\Models\Invoice;
use App\Models\PharmacySale;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use App\Observers\AppointmentObserver;
use App\Observers\UserObserver;
use App\Observers\PrescriptionObserver;
use App\Observers\VisitRecordObserver;
use App\Observers\PatientFileObserver;
use App\Observers\PatientFolderObserver;
use App\Observers\DrugObserver;
use App\Observers\InvoiceObserver;
use App\Observers\PharmacySaleObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

        RateLimiter::for('login', function (Request $request) {
            return [
                Limit::perMinute(5)->by($request->input('email') . '|' . $request->ip()),
                Limit::perMinute(20)->by($request->ip()), // global IP cap
            ];
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('forgot-password', function (Request $request) {
            return Limit::perMinute(3)->by($request->input('email') . '|' . $request->ip());
        });

        RateLimiter::for('reset-password', function (Request $request) {
            return Limit::perMinute(5)->by($request->input('email') . '|' . $request->ip());
        });

        RateLimiter::for('contact-form', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        // Backs the blanket throttleApi() call in bootstrap/app.php — every
        // API route falls back to this if it has no tighter named limiter.
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        Appointment::observe(AppointmentObserver::class);
        User::observe(UserObserver::class);
        Prescription::observe(PrescriptionObserver::class);
        VisitRecord::observe(VisitRecordObserver::class);
        PatientFile::observe(PatientFileObserver::class);
        PatientFolder::observe(PatientFolderObserver::class);
        Drug::observe(DrugObserver::class);
        Invoice::observe(InvoiceObserver::class);
        PharmacySale::observe(PharmacySaleObserver::class);
    }
}
