<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientFile extends Model
{
    protected $fillable = [
        'patient_folder_id',
        'first_name',
        'last_name',
        'email',
        'place_of_origin',
        'tribe',
        'occupation',
        'religion',
        'marital_status',
        'date_of_birth',
        'gender',
        'blood_type',
        'allergies',
        'chronic_conditions',
        'height_cm',
        'weight_kg',
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
        'created_by',
        'current_doctor_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'blood_test_date' => 'date',
    ];

    public function folder()
    {
        return $this->belongsTo(PatientFolder::class, 'patient_folder_id');
    }

    public function visitRecords()
    {
        return $this->hasMany(VisitRecord::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function currentDoctor()
    {
        return $this->belongsTo(User::class, 'current_doctor_id');
    }

    public function transfers()
    {
        return $this->hasMany(PatientFileTransfer::class);
    }

    // Full name helper
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    protected $appends = ['full_name'];
}
