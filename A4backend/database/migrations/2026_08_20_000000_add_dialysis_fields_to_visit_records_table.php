<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Dialysis sessions are logged as visit_records too (visit_type='dialysis')
// rather than a separate table — a session is structurally the same thing
// as a visit (dated encounter, tied to a patient file, attending doctor,
// optionally billed), so this reuses the existing invoice/observer/CRUD
// pipeline instead of duplicating it. session_number is always computed
// server-side (see VisitRecord::nextDialysisSessionNumber) and is never a
// client-editable input, same spirit as card_number/invoice_number.
//
// Deliberately dialysis-specific typed columns, not a generic
// treatment_type free-text field or a JSON "extra data" blob — an earlier
// design proposed the generic version, but structured typed columns are a
// real clinical upgrade over free text (queryable, validated, matches what
// a nurse/doctor actually fills in per session) and were chosen instead.
// If another recurring treatment type (chemo, physio, ANC visits, etc.) is
// ever actually requested, repeat this exact shape rather than reaching
// for something generic: a new visit_type enum value via a raw
// `ALTER TABLE ... MODIFY COLUMN` migration (same pattern as
// 2026_08_21_000000_add_lab_role_to_users_table.php did for users.role),
// plus a handful of new typed nullable columns for that type's own real
// fields. Don't build this ahead of an actual request — see VisitRecord.php
// and MedicalRecords.jsx for the other two places this same per-type
// pattern continues (session-number-style logic, and the tab/form UI).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visit_records', function (Blueprint $table) {
            $table->enum('visit_type', ['general', 'dialysis'])
                ->default('general')->after('doctor_id');

            $table->unsignedInteger('session_number')->nullable();
            $table->string('access_type')->nullable();
            $table->string('infection_status')->nullable();
            $table->string('machine_no')->nullable();
            $table->string('pre_bp')->nullable();
            $table->string('post_bp')->nullable();
            $table->decimal('pre_weight_kg', 5, 2)->nullable();
            $table->decimal('post_weight_kg', 5, 2)->nullable();
            $table->integer('uf_ml')->nullable();
            $table->decimal('duration_hours', 4, 1)->nullable();
            $table->text('complications')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('visit_records', function (Blueprint $table) {
            $table->dropColumn([
                'visit_type',
                'session_number',
                'access_type',
                'infection_status',
                'machine_no',
                'pre_bp',
                'post_bp',
                'pre_weight_kg',
                'post_weight_kg',
                'uf_ml',
                'duration_hours',
                'complications',
            ]);
        });
    }
};
