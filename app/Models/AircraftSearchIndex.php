<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AircraftSearchIndex extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'current_owners' => 'array',
    ];
}
