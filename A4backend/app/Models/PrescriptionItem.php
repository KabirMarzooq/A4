<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrescriptionItem extends Model
{
    protected $fillable = [
        'prescription_id',
        'drug_id',
        'drug_name',
        'frequency',
        'duration',
        'dosage',
        'quantity',
        'unit_price',
        'total',
    ];

    public function drug()
    {
        return $this->belongsTo(Drug::class);
    }
}
