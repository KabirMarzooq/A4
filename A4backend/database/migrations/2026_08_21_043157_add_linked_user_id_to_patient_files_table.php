<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Lets a walk-in patient who later creates an online account "claim" the
// hospital record that already exists for them (RecordClaimController) —
// the online-facing User and the desk-facing PatientFile are otherwise
// completely disconnected identities (see the clinical data model note in
// the README). Nullable and one-directional: a PatientFile doesn't require
// a linked account, and one User can end up linked to more than one file
// (e.g. if they were mistakenly registered twice at the desk).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patient_files', function (Blueprint $table) {
            $table->foreignId('linked_user_id')->nullable()
                ->after('current_doctor_id')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('patient_files', function (Blueprint $table) {
            $table->dropForeign(['linked_user_id']);
            $table->dropColumn('linked_user_id');
        });
    }
};
