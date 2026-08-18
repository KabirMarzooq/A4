<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitRecord extends Model
{
    protected $fillable = [
        'patient_file_id',
        'doctor_id',
        'visit_date',
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
    ];

    protected $casts = [
        'visit_date'       => 'date',
        'temperature_c'    => 'decimal:1',
        'consultation_fee' => 'decimal:2',
    ];

    public function patientFile()
    {
        return $this->belongsTo(PatientFile::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
