<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Billing during a stay reuses the existing per-visit consultation_fee ->
// invoice flow exactly as-is (see VisitRecord.admission_id below) — an
// admission here only tracks status/ward, deliberately no charges table.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_file_id')->constrained()->onDelete('cascade');
            $table->foreignId('admitting_doctor_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->string('ward'); // free text — e.g. "General Ward", "Maternity"
            $table->text('reason_for_admission')->nullable();
            $table->date('admission_date');
            $table->enum('status', ['admitted', 'discharged'])->default('admitted');
            $table->date('discharge_date')->nullable();
            $table->text('discharge_summary')->nullable();
            $table->text('discharge_diagnosis')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::table('visit_records', function (Blueprint $table) {
            $table->foreignId('admission_id')->nullable()->after('doctor_id')
                ->constrained('admissions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('visit_records', function (Blueprint $table) {
            $table->dropConstrainedForeignId('admission_id');
        });

        Schema::dropIfExists('admissions');
    }
};
