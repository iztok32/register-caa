<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Owner extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function aircraftOwners()
    {
        return $this->hasMany(AircraftOwner::class, 'owner_empic_id', 'empic_id');
    }
}
