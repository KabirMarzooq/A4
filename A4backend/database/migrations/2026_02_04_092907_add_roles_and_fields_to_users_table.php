<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Role Enum
            $table->enum('role', ['patient', 'doctor', 'receptionist', 'admin', 'pharmacy'])
                ->default('patient')
                ->after('email');

            // Phone Number
            $table->string('phone')->nullable()->after('role');

            // Professional Details (Nullable: because Patients won't have these)
            $table->string('specialization')->nullable()->after('phone'); // For Doctors
            $table->string('license_id')->nullable()->after('specialization'); // For Doctors
            $table->string('staff_id')->nullable()->after('license_id'); // For Receptionists/Staff
            $table->timestamp('last_login_at')->nullable();

            // 4. Soft Deletes (Standard practice)
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
