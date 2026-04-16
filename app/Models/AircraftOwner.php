<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AircraftOwner extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function aircraft()
    {
        return $this->belongsTo(Aircraft::class, 'aircraft_registration_id', 'empic_id');
    }

    public function owner()
    {
        return $this->belongsTo(Owner::class, 'owner_empic_id', 'empic_id');
    }
}
