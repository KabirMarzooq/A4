<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientFileTransfer extends Model
{
    protected $fillable = [
        'patient_file_id',
        'from_user_id',
        'to_doctor_id',
        'reason',
    ];

    public function patientFile()
    {
        return $this->belongsTo(PatientFile::class);
    }

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toDoctor()
    {
        return $this->belongsTo(User::class, 'to_doctor_id');
    }
}
