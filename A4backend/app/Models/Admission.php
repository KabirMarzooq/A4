<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Admission extends Model
{
    protected $fillable = [
        'patient_file_id',
        'admitting_doctor_id',
        'ward',
        'reason_for_admission',
        'admission_date',
        'status',
        'discharge_date',
        'discharge_summary',
        'discharge_diagnosis',
        'created_by',
    ];

    protected $casts = [
        'admission_date' => 'date',
        'discharge_date' => 'date',
    ];

    public function patientFile()
    {
        return $this->belongsTo(PatientFile::class);
    }

    public function admittingDoctor()
    {
        return $this->belongsTo(User::class, 'admitting_doctor_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function visitRecords()
    {
        return $this->hasMany(VisitRecord::class);
    }
}
