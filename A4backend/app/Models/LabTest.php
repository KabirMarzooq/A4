<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LabTest extends Model
{
    protected $fillable = ['name', 'category', 'price'];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function orders()
    {
        return $this->hasMany(LabOrder::class);
    }
}
