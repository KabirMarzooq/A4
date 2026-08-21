<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

// Lab no longer needs to create a full patient folder+file for a walk-in who
// only wants a test — patient_file_id becomes optional and a standalone
// order carries its own name/email/phone snapshot instead (same reasoning
// as synced_booking_requests: no folder to attach to, so store what's known
// directly on the order). Price also becomes optional — lab decouples from
// pricing entirely in this phase; the lab_tests catalog price stays as
// reception's future pricing reference, not something lab enters per order.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lab_orders', function (Blueprint $table) {
            $table->dropForeign(['patient_file_id']);
        });

        DB::statement('ALTER TABLE lab_orders MODIFY COLUMN patient_file_id BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE lab_orders MODIFY COLUMN price DECIMAL(10,2) NULL');

        Schema::table('lab_orders', function (Blueprint $table) {
            $table->string('patient_name')->nullable()->after('patient_file_id');
            $table->string('patient_email')->nullable()->after('patient_name');
            $table->string('patient_phone')->nullable()->after('patient_email');
            $table->foreign('patient_file_id')->references('id')->on('patient_files')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('lab_orders', function (Blueprint $table) {
            $table->dropForeign(['patient_file_id']);
            $table->dropColumn(['patient_name', 'patient_email', 'patient_phone']);
        });

        DB::statement('ALTER TABLE lab_orders MODIFY COLUMN price DECIMAL(10,2) NOT NULL');
        DB::statement('ALTER TABLE lab_orders MODIFY COLUMN patient_file_id BIGINT UNSIGNED NOT NULL');

        Schema::table('lab_orders', function (Blueprint $table) {
            $table->foreign('patient_file_id')->references('id')->on('patient_files')->cascadeOnDelete();
        });
    }
};
