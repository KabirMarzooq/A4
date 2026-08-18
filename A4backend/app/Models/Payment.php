<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'invoice_id',
        'patient_id',
        'amount',
        'currency',
        'status',
        'gateway',
        'gateway_reference',
        'gateway_response',
        'payment_method',
        'paid_at',
    ];

    protected $casts = [
        'amount'           => 'decimal:2',
        'paid_at'          => 'datetime',
        'gateway_response' => 'array',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function receipt()
    {
        return $this->hasOne(Receipt::class);
    }
}
