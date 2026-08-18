<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// The prescriptions migration was edited to add patient_file_id after it had
// already run against the live database, so the column was never actually
// created — the model/controller have referenced it as if it existed the
// whole time, silently breaking prescription creation from the patient-file
// (folder) flow. Same root cause as 2026_08_17_000000_fix_invoices_table_schema_drift.
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('prescriptions', 'patient_file_id')) {
            Schema::table('prescriptions', function (Blueprint $table) {
                $table->foreignId('patient_file_id')->nullable()->after('patient_id')
                    ->constrained('patient_files')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('patient_file_id');
        });
    }
};
