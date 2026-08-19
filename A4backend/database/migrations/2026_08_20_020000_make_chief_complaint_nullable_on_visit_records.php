<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// chief_complaint was NOT NULL from the original visit_records migration —
// fine for general visits, but the dialysis register has no equivalent
// field and the controller now validates it as required only when
// visit_type=general (PatientFolderController::storeVisitRecord). The
// column itself needs to allow null to match, or every dialysis session
// insert fails at the DB layer regardless of what validation allows.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE visit_records MODIFY COLUMN chief_complaint VARCHAR(255) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE visit_records MODIFY COLUMN chief_complaint VARCHAR(255) NOT NULL');
    }
};
