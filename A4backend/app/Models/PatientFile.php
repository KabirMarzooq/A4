<?php

namespace App\Models;

use App\Support\TextCase;
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
        'linked_user_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'blood_test_date' => 'date',
    ];

    // Title Case for proper nouns — a name typed in ALL CAPS or all
    // lowercase normalizes the same way regardless of entry point.
    public function setFirstNameAttribute($value): void
    {
        $this->attributes['first_name'] = TextCase::title($value);
    }

    public function setLastNameAttribute($value): void
    {
        $this->attributes['last_name'] = TextCase::title($value);
    }

    public function setPlaceOfOriginAttribute($value): void
    {
        $this->attributes['place_of_origin'] = TextCase::title($value);
    }

    public function setTribeAttribute($value): void
    {
        $this->attributes['tribe'] = TextCase::title($value);
    }

    public function setOccupationAttribute($value): void
    {
        $this->attributes['occupation'] = TextCase::title($value);
    }

    public function setReligionAttribute($value): void
    {
        $this->attributes['religion'] = TextCase::title($value);
    }

    public function setNextOfKinNameAttribute($value): void
    {
        $this->attributes['next_of_kin_name'] = TextCase::title($value);
    }

    public function setNextOfKinRelationshipAttribute($value): void
    {
        $this->attributes['next_of_kin_relationship'] = TextCase::title($value);
    }

    // Sentence case — free-text, not a name.
    public function setAllergiesAttribute($value): void
    {
        $this->attributes['allergies'] = TextCase::sentence($value);
    }

    public function setChronicConditionsAttribute($value): void
    {
        $this->attributes['chronic_conditions'] = TextCase::sentence($value);
    }

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

    // The online account this desk-created file has been "claimed" by, if
    // any — see RecordClaimController.
    public function linkedUser()
    {
        return $this->belongsTo(User::class, 'linked_user_id');
    }

    public function transfers()
    {
        return $this->hasMany(PatientFileTransfer::class);
    }

    public function admissions()
    {
        return $this->hasMany(Admission::class);
    }

    // The active stay, if any — powers the "Admitted" badge without the
    // frontend having to filter the full admissions history itself.
    public function currentAdmission()
    {
        return $this->hasOne(Admission::class)
            ->where('status', 'admitted')
            ->latestOfMany();
    }

    // Full name helper
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    protected $appends = ['full_name'];
}
