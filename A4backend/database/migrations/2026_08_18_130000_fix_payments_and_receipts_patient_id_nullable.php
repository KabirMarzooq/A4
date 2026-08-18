<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Same root cause as 2026_08_17_000000_fix_invoices_table_schema_drift: the
 * create_payments_table / create_receipts_table migration files already
 * declare patient_id as nullable(), but the live columns never got that
 * change (edited after the migrations had already run). invoices.patient_id
 * has legitimately been nullable for a while — most invoices today come from
 * the folder/file system (PatientFolderController), where the patient is a
 * PatientFile, not a User, so there's often no patient_id to give at all.
 * ReceptionBillingController::markCashPaid() already writes
 * $invoice->patient_id ?? null into Payment/Receipt, which 500s the moment
 * that's actually null — i.e. on effectively every folder-based invoice.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE payments MODIFY COLUMN patient_id BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE receipts MODIFY COLUMN patient_id BIGINT UNSIGNED NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE payments MODIFY COLUMN patient_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE receipts MODIFY COLUMN patient_id BIGINT UNSIGNED NOT NULL');
    }
};
