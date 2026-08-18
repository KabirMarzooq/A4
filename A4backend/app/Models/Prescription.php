<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\PatientFile;

// app/Models/Prescription.php

class Prescription extends Model
{
    protected $fillable = [
        'doctor_id',
        'patient_id',
        'patient_file_id',
        'medication',
        'dosage',
        'frequency',
        'duration',
        'instructions'
    ];

    // Link to patient
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function patientFile()
    {
        return $this->belongsTo(PatientFile::class, 'patient_file_id');
    }

    // Link to doctor
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function items()
    {
        return $this->hasMany(PrescriptionItem::class);
    }
}
