<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // LEVEL 1: Family folder — identified by phone number
        Schema::create('patient_folders', function (Blueprint $table) {
            $table->id();
            $table->string('folder_name');           // e.g. "Marzooq Family"
            $table->string('phone')->unique();        // family phone — unique identifier
            $table->string('address')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // LEVEL 2: Individual family member file
        Schema::create('patient_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_folder_id')->constrained()->onDelete('cascade');
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
            $table->string('blood_type')->nullable();
            $table->text('allergies')->nullable();
            $table->text('chronic_conditions')->nullable();
            $table->decimal('height_cm', 5, 2)->nullable();
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // LEVEL 3: Visit/encounter record per patient file
        Schema::create('visit_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_file_id')->constrained()->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->date('visit_date');
            $table->string('chief_complaint');
            $table->text('physical_examination')->nullable();  // P.E
            $table->text('investigation')->nullable();
            $table->text('test_results')->nullable();
            $table->string('blood_pressure')->nullable();
            $table->decimal('temperature_c', 4, 1)->nullable();
            $table->integer('heart_rate')->nullable();
            $table->integer('oxygen_saturation')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('notes')->nullable();
            $table->string('action_taken')->nullable();
            $table->decimal('consultation_fee', 10, 2)->nullable(); // triggers invoice
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_records');
        Schema::dropIfExists('patient_files');
        Schema::dropIfExists('patient_folders');
    }
};
