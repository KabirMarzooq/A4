<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SyncedBookingRequest extends Model
{
    protected $fillable = [
        'cloud_appointment_id',
        'patient_name',
        'patient_phone',
        'patient_email',
        'requested_doctor_name',
        'appointment_date',
        'appointment_time',
        'reason',
        'status',
        'decline_reason',
        'pulled_at',
        'status_pushed_at',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'pulled_at'         => 'datetime',
        'status_pushed_at'  => 'datetime',
    ];
}
