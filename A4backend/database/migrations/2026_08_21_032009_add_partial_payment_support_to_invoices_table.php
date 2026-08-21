<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Running total across every Payment against this invoice —
            // lets a partial payment leave a visible balance instead of the
            // all-or-nothing paid/unpaid split invoices had before.
            $table->decimal('amount_paid', 10, 2)->default(0)->after('total_amount');
        });

        DB::statement("ALTER TABLE invoices MODIFY COLUMN status ENUM('unpaid', 'paid', 'partially_paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'unpaid'");

        // New type for invoices reception/admin write directly (Create
        // Invoice), distinct from the doctor-authored 'Hospital_Bill' type
        // that visit records used to generate before Phase 3 removed that.
        DB::statement("ALTER TABLE invoices MODIFY COLUMN type ENUM('consultation', 'prescription', 'lab_test', 'surgery', 'emergency', 'Hospital_Bill', 'Card_Bill', 'reception_bill') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE invoices MODIFY COLUMN type ENUM('consultation', 'prescription', 'lab_test', 'surgery', 'emergency', 'Hospital_Bill', 'Card_Bill') NOT NULL");
        DB::statement("ALTER TABLE invoices MODIFY COLUMN status ENUM('unpaid', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'unpaid'");

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('amount_paid');
        });
    }
};
