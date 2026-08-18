<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Same schema-drift root cause as the prescriptions.patient_id fix in this
// same batch: prescription_items was edited to add a dosage column after
// the migration had already run, so it was never actually created live —
// PrescriptionController::store() has referenced it as if it existed the
// whole time, 500ing on every prescription with 1+ drug items.
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('prescription_items', 'dosage')) {
            Schema::table('prescription_items', function (Blueprint $table) {
                $table->string('dosage')->nullable()->after('duration');
            });
        }
    }

    public function down(): void
    {
        Schema::table('prescription_items', function (Blueprint $table) {
            $table->dropColumn('dosage');
        });
    }
};
