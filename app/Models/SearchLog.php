<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchLog extends Model
{
    public $timestamps = false;

    protected $fillable = ['ip_address', 'user_id', 'query', 'results_count', 'is_blocked'];

    protected $casts = [
        'is_blocked'   => 'boolean',
        'created_at'   => 'datetime',
    ];

    public static function boot(): void
    {
        parent::boot();
        static::creating(fn($m) => $m->created_at = now());
    }
}
