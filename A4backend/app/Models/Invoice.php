<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\PatientFile;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_number',
        'patient_id',
        'patient_file_id',
        'doctor_id',
        'appointment_id',
        'type',
        'subtotal',
        'service_charge',
        'total_amount',
        'amount_paid',
        'currency',
        'status',
        'due_date',
        'paid_at',
        'folder_id',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'paid_at'  => 'datetime',
        'subtotal'        => 'decimal:2',
        'service_charge'  => 'decimal:2',
        'total_amount'    => 'decimal:2',
        'amount_paid'     => 'decimal:2',
    ];

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Every successful payment against this invoice — a partially-paid
     * invoice can have more than one. Kept alongside payment() below rather
     * than replacing it, since most of the codebase only ever needed "the"
     * payment and still does for a fully-paid invoice.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class)->where('status', 'successful');
    }

    /**
     * The most recent payment — existing single-payment call sites
     * (receipts, patient billing view) keep working unchanged.
     */
    public function payment()
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    /**
     * Every receipt issued against this invoice — one per payment, so a
     * partially-paid invoice can have several.
     */
    public function receipts()
    {
        return $this->hasMany(Receipt::class);
    }

    /**
     * The most recent receipt — existing single-receipt call sites keep
     * working unchanged.
     */
    public function receipt()
    {
        return $this->hasOne(Receipt::class)->latestOfMany();
    }

    public function outstandingBalance(): float
    {
        return round((float) $this->total_amount - (float) $this->amount_paid, 2);
    }

    public static function generateInvoiceNumber(): string
    {
        $year = now()->year;
        $last = self::whereYear('created_at', $year)->count() + 1;
        return 'A4C-' . $year . '-' . str_pad($last, 5, '0', STR_PAD_LEFT);
    }

    public function patientFile()
    {
        return $this->belongsTo(PatientFile::class, 'patient_file_id');
    }

    public function folder()
    {
        return $this->belongsTo(PatientFolder::class, 'folder_id');
    }
}
