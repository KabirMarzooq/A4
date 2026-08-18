<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalReportRequest extends Model
{
    protected $fillable = [
        'patient_id',
        'admin_id',
        'date_from',
        'date_to',
        'reason',
        'status',
        'rejection_reason',
    ];

    protected $casts = [
        'date_from' => 'date',
        'date_to'   => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
