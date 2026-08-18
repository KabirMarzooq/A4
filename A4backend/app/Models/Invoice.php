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

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function receipt()
    {
        return $this->hasOne(Receipt::class);
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
