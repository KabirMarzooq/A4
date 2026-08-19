<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Same migration runs on both the cloud DB and the local DB (one codebase,
// two deployments) — each side only uses the half that applies to it:
// cloud reads/writes pulled_by_local_at, local reads/writes
// synced_booking_requests. Kept in one file so both deployments stay on
// the identical migration history.
return new class extends Migration
{
    public function up(): void
    {
        // CLOUD SIDE: marks when an online appointment has been pulled by the
        // local server, so it isn't sent down again on the next sync.
        Schema::table('appointments', function (Blueprint $table) {
            $table->timestamp('pulled_by_local_at')->nullable();
        });

        // LOCAL SIDE: incoming-request queue. Deliberately not tied to the
        // appointments/users tables — the patient it refers to only has an
        // account in the cloud database, not this one. Plain snapshot
        // fields avoid needing a matching local user record to exist, same
        // reasoning as VisitRecord's dialysis fields / LabOrder.test_name.
        Schema::create('synced_booking_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cloud_appointment_id')->unique();
            $table->string('patient_name');
            $table->string('patient_phone')->nullable();
            $table->string('patient_email')->nullable();
            $table->string('requested_doctor_name')->nullable();
            $table->date('appointment_date');
            $table->string('appointment_time');
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'declined'])->default('pending');
            $table->text('decline_reason')->nullable();
            $table->timestamp('pulled_at')->nullable();
            $table->timestamp('status_pushed_at')->nullable(); // null = not yet pushed back to cloud
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('synced_booking_requests');
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('pulled_by_local_at');
        });
    }
};
