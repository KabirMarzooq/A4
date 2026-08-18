<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Doctor/receptionist/pharmacy accounts now require admin approval before
// they can log in (registration no longer collects unverified license/staff
// IDs). Existing accounts default to "approved" so real staff already using
// the system aren't locked out — the pending state only applies to new
// registrations from here, set explicitly in AuthController::register().
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved'])->default('approved')->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
