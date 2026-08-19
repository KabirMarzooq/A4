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
