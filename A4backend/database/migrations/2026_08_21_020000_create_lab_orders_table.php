<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Billing reuses the existing Invoice/InvoiceItem pipeline (type=lab_test,
// already a valid value on invoices.type) exactly like a visit record's
// consultation_fee does — no separate lab billing table.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_file_id')->constrained()->onDelete('cascade');
            $table->foreignId('visit_record_id')->nullable()
                ->constrained('visit_records')->nullOnDelete();
            $table->foreignId('lab_test_id')->nullable()
                ->constrained('lab_tests')->nullOnDelete();
            $table->string('test_name'); // snapshot — survives catalog price changes
            $table->decimal('price', 10, 2);
            $table->foreignId('ordered_by')->nullable()
                ->constrained('users')->nullOnDelete(); // ordering doctor, null if walk-in
            $table->foreignId('lab_staff_id')->nullable()
                ->constrained('users')->nullOnDelete(); // who completed it
            $table->foreignId('invoice_id')->nullable()
                ->constrained('invoices')->nullOnDelete();
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->text('result_summary')->nullable();
            $table->string('result_file_path')->nullable();
            $table->string('result_file_name')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->string('sent_to_email')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_orders');
    }
};
