<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Same root cause as 2026_08_17_000000_fix_invoices_table_schema_drift and
// 2026_08_18_130000_fix_payments_and_receipts_patient_id_nullable: the
// create_prescriptions_table migration was edited to declare patient_id as
// nullable(), but the live column never got that change (edited after the
// migration had already run). A prescription written against a patient_file
// (folder flow) has no patient_id at all, so the insert 500s the moment a
// doctor issues one for a patient registered only under the newer
// folder/file system.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE prescriptions MODIFY COLUMN patient_id BIGINT UNSIGNED NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE prescriptions MODIFY COLUMN patient_id BIGINT UNSIGNED NOT NULL');
    }
};
