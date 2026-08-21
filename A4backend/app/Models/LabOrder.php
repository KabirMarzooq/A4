<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabOrder extends Model
{
    protected $fillable = [
        'patient_file_id',
        'patient_name',
        'patient_email',
        'patient_phone',
        'visit_record_id',
        'lab_test_id',
        'test_name',
        'price',
        'ordered_by',
        'lab_staff_id',
        'invoice_id',
        'status',
        'result_summary',
        'result_file_path',
        'result_file_name',
        'completed_at',
        'sent_at',
        'sent_to_email',
    ];

    protected $casts = [
        'price'        => 'decimal:2',
        'completed_at' => 'datetime',
        'sent_at'      => 'datetime',
    ];

    public function patientFile()
    {
        return $this->belongsTo(PatientFile::class);
    }

    public function visitRecord()
    {
        return $this->belongsTo(VisitRecord::class);
    }

    public function labTest()
    {
        return $this->belongsTo(LabTest::class);
    }

    public function orderedBy()
    {
        return $this->belongsTo(User::class, 'ordered_by');
    }

    public function labStaff()
    {
        return $this->belongsTo(User::class, 'lab_staff_id');
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
