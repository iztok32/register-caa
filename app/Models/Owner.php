<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Owner extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function getDisplayNameAttribute(): string
    {
        if ($this->organisation_name) {
            return $this->organisation_name2
                ? "{$this->organisation_name} / {$this->organisation_name2}"
                : $this->organisation_name;
        }
        $name = trim("{$this->person_last_name} {$this->person_first_name}");
        return $name ?: "EMPIC #{$this->empic_id}";
    }

    public function getOwnerTypeAttribute(): string
    {
        return $this->organisation_name ? 'organisation' : 'person';
    }

    public function aircraftOwners()
    {
        return $this->hasMany(AircraftOwner::class, 'owner_empic_id', 'empic_id');
    }

    public function activeAircraftOwners()
    {
        return $this->aircraftOwners()->active();
    }
}
