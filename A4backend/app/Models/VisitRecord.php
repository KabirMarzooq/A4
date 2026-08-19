<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitRecord extends Model
{
    protected $fillable = [
        'patient_file_id',
        'doctor_id',
        'admission_id',
        'visit_date',
        'visit_type',
        'chief_complaint',
        'physical_examination',
        'investigation',
        'test_results',
        'blood_pressure',
        'temperature_c',
        'heart_rate',
        'oxygen_saturation',
        'diagnosis',
        'notes',
        'action_taken',
        'consultation_fee',
        'session_number',
        'access_type',
        'infection_status',
        'machine_no',
        'pre_bp',
        'post_bp',
        'pre_weight_kg',
        'post_weight_kg',
        'uf_ml',
        'duration_hours',
        'complications',
    ];

    protected $casts = [
        'visit_date'       => 'date',
        'temperature_c'    => 'decimal:1',
        'consultation_fee' => 'decimal:2',
        'pre_weight_kg'    => 'decimal:2',
        'post_weight_kg'   => 'decimal:2',
        'duration_hours'   => 'decimal:1',
    ];

    public function patientFile()
    {
        return $this->belongsTo(PatientFile::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function admission()
    {
        return $this->belongsTo(Admission::class);
    }

    // Session numbers are always server-computed, never client input — same
    // spirit as PatientFolder::generateCardNumber() / Invoice::generateInvoiceNumber().
    //
    // This is the one piece of genuinely dialysis-specific *behavior* (not
    // just fields) on this model. A future recurring-treatment type with
    // its own computed/auto-numbering logic gets its own equivalent static
    // method here (e.g. nextChemoSessionNumber()), not a generic
    // nextSessionNumber($type) — mirrors the per-type-columns decision in
    // the dialysis migration rather than reaching for something shared.
    public static function nextDialysisSessionNumber(int $patientFileId): int
    {
        return self::where('patient_file_id', $patientFileId)
            ->where('visit_type', 'dialysis')
            ->count() + 1;
    }
}
