<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    protected $fillable = [
        'receipt_number',
        'payment_id',
        'invoice_id',
        'patient_id',
        'amount_paid',
        'currency',
        'payment_method',
        'issued_at',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'issued_at'   => 'datetime',
    ];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public static function generateReceiptNumber(): string
    {
        $year = now()->year;
        $last = self::whereYear('created_at', $year)->count() + 1;
        return 'REC-' . $year . '-' . str_pad($last, 5, '0', STR_PAD_LEFT);
    }
}
