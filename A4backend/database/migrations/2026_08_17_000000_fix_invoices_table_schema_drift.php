<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * The original create_invoices_table migration was edited after it had
 * already run against this database (it now defines patient_file_id and a
 * nullable patient_id, but the live table never got those changes — Laravel
 * only applies a migration file's contents the moment it first runs).
 * This syncs the live schema to what the migration file — and the
 * application code, e.g. PatientFolderController — already expect.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            if (!Schema::hasColumn('invoices', 'patient_file_id')) {
                $table->foreignId('patient_file_id')
                    ->nullable()
                    ->after('patient_id')
                    ->constrained('patient_files')
                    ->onDelete('set null');
            }
        });

        DB::statement('ALTER TABLE invoices MODIFY COLUMN patient_id BIGINT UNSIGNED NULL');
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            if (Schema::hasColumn('invoices', 'patient_file_id')) {
                $table->dropConstrainedForeignId('patient_file_id');
            }
        });
    }
};
