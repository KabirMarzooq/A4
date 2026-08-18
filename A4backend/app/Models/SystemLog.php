<?php
// app/Models/SystemLog.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    protected $fillable = [
        'user_id',
        'role',
        'action',
        'target_type',
        'target_id',
        'description',
        'ip_address'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function log(string $action, string $description, $target = null): void
    {
        $user = auth('api')->user();

        self::create([
            'user_id'     => $user?->id,
            'role'        => $user?->role,
            'action'      => $action,
            'target_type' => $target ? class_basename($target) : null,
            'target_id'   => $target?->id ?? null,
            'description' => $description,
            'ip_address'  => request()->ip(),
        ]);
    }
}
