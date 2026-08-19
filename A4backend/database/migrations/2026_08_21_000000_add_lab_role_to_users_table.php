<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// users.role is a native MySQL ENUM (see 2026_02_04_092907_add_roles_and_fields_to_users_table.php)
// so adding the new "lab" value requires a raw ALTER, not just appending to
// the Laravel-side enum() call in a fresh migration.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('patient', 'doctor', 'receptionist', 'admin', 'pharmacy', 'lab') NOT NULL DEFAULT 'patient'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('patient', 'doctor', 'receptionist', 'admin', 'pharmacy') NOT NULL DEFAULT 'patient'");
    }
};
