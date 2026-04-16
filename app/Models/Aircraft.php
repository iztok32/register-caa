<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aircraft extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function aircraftOwners()
    {
        return $this->hasMany(AircraftOwner::class, 'aircraft_registration_id', 'empic_id');
    }
}
