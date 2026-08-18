<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_file_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_file_id')->constrained()->onDelete('cascade');
            $table->foreignId('from_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('to_doctor_id')->constrained('users')->onDelete('cascade');
            $table->string('reason')->nullable();
            $table->timestamps();
        });

        Schema::table('patient_files', function (Blueprint $table) {
            $table->foreignId('current_doctor_id')->nullable()->after('created_by')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('patient_files', function (Blueprint $table) {
            $table->dropConstrainedForeignId('current_doctor_id');
        });

        Schema::dropIfExists('patient_file_transfers');
    }
};
