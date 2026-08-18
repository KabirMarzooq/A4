<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Fields from the hospital's physical registration card that weren't yet
// captured. All nullable — most won't be filled in for every patient.
// blood_group/rhesus/genotype/sensitivity/lab_ref_no/blood_test_date are a
// separate, formal lab-referenced blood-typing record — distinct from the
// existing blood_type column, which stays as the quick clinical vitals chip.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patient_files', function (Blueprint $table) {
            $table->string('email')->nullable()->after('last_name');
            $table->string('place_of_origin')->nullable()->after('email');
            $table->string('tribe')->nullable()->after('place_of_origin');
            $table->string('occupation')->nullable()->after('tribe');
            $table->string('religion')->nullable()->after('occupation');
            $table->string('marital_status')->nullable()->after('religion');

            $table->string('lab_ref_no')->nullable()->after('weight_kg');
            $table->enum('blood_group', ['A', 'B', 'AB', 'O'])->nullable()->after('lab_ref_no');
            $table->enum('rhesus', ['Positive', 'Negative'])->nullable()->after('blood_group');
            $table->string('genotype')->nullable()->after('rhesus');
            $table->string('sensitivity')->nullable()->after('genotype');
            $table->date('blood_test_date')->nullable()->after('sensitivity');

            $table->string('next_of_kin_name')->nullable()->after('blood_test_date');
            $table->string('next_of_kin_relationship')->nullable()->after('next_of_kin_name');
            $table->string('next_of_kin_phone')->nullable()->after('next_of_kin_relationship');
            $table->text('next_of_kin_address')->nullable()->after('next_of_kin_phone');
            $table->string('next_of_kin_email')->nullable()->after('next_of_kin_address');
        });
    }

    public function down(): void
    {
        Schema::table('patient_files', function (Blueprint $table) {
            $table->dropColumn([
                'email',
                'place_of_origin',
                'tribe',
                'occupation',
                'religion',
                'marital_status',
                'lab_ref_no',
                'blood_group',
                'rhesus',
                'genotype',
                'sensitivity',
                'blood_test_date',
                'next_of_kin_name',
                'next_of_kin_relationship',
                'next_of_kin_phone',
                'next_of_kin_address',
                'next_of_kin_email',
            ]);
        });
    }
};
