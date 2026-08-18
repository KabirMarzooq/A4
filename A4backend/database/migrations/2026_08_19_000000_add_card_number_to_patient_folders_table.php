<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\PatientFolder;

// Replaces the old workflow, where a family folder's phone number doubled as
// the hospital card identifier, with a real system-generated card number —
// never a form input, never editable after creation (see
// PatientFolder::generateCardNumber() and PatientFolderController::storeFolder()).
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('patient_folders', 'card_number')) {
            Schema::table('patient_folders', function (Blueprint $table) {
                $table->string('card_number')->nullable()->unique()->after('folder_name');
            });
        }

        // Backfill existing folders in creation order so they aren't left
        // permanently without a card number. Assigned with an explicit
        // per-year counter rather than PatientFolder::generateCardNumber() —
        // that method counts existing rows to pick the next number, which
        // only works at live-creation time (before the new row exists);
        // here every row already exists, so the count would never change
        // across the loop and every folder would get the same number.
        $counters = [];
        PatientFolder::whereNull('card_number')->orderBy('id')->each(function (PatientFolder $folder) use (&$counters) {
            $year = $folder->created_at->year;
            $counters[$year] = ($counters[$year] ?? 0) + 1;
            $folder->update([
                'card_number' => 'A4C-P-' . $year . '-' . str_pad($counters[$year], 5, '0', STR_PAD_LEFT),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('patient_folders', function (Blueprint $table) {
            $table->dropColumn('card_number');
        });
    }
};
