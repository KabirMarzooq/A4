<?php
// ── PatientFolder.php ─────────────────────────────────────────────────────────
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientFolder extends Model
{
    protected $fillable = [
        'folder_name',
        'card_number',
        'phone',
        'address',
        'created_by',
    ];

    public function files()
    {
        return $this->hasMany(PatientFile::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // System-assigned hospital card number — never a form input, never
    // editable after creation. "-P-" (Patient) distinguishes it at a glance
    // from invoice numbers, which otherwise share the same A4C-{year}-{n} shape.
    public static function generateCardNumber(): string
    {
        $year = now()->year;
        $last = self::whereYear('created_at', $year)->count() + 1;
        return 'A4C-P-' . $year . '-' . str_pad($last, 5, '0', STR_PAD_LEFT);
    }
}
