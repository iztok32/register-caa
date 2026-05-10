<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aircraft extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'registered_on'   => 'date',
            'deregistered_on' => 'date',
        ];
    }

    public function aircraftOwners()
    {
        return $this->hasMany(AircraftOwner::class, 'aircraft_registration_id', 'empic_id');
    }

    public function currentOwners()
    {
        return $this->aircraftOwners()->active();
    }
}
