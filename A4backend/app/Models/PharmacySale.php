<?php
// ── PharmacySale.php ──────────────────────────────────────────────────────────
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PharmacySale extends Model
{
    protected $fillable = [
        'receptionist_id',
        'sale_date',
        'total_amount',
        'status',
        'closed_at',
    ];

    protected $casts = [
        'sale_date'    => 'date',
        'closed_at'    => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(PharmacySaleItem::class);
    }

    public function receptionist()
    {
        return $this->belongsTo(User::class, 'receptionist_id');
    }

    // Recalculate total from all items
    public function recalculateTotal()
    {
        $this->update([
            'total_amount' => $this->items()->sum('total_price'),
        ]);
    }
}
