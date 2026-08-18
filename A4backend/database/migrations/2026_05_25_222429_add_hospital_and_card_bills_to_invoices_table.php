<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE invoices MODIFY COLUMN type ENUM('consultation', 'prescription', 'lab_test', 'surgery', 'emergency', 'Hospital_Bill', 'Card_Bill') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE invoices MODIFY COLUMN type ENUM('consultation', 'prescription', 'lab_test', 'surgery', 'emergency') NOT NULL");
    }
};
