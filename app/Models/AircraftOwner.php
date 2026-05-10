<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AircraftOwner extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'start_date'           => 'date',
            'end_date'             => 'date',
            'owner_since'          => 'date',
            'operator_since'       => 'date',
            'is_closed'            => 'boolean',
            'ownership_percentage' => 'decimal:2',
        ];
    }

    /**
     * Unified start date: picks the role-appropriate date column.
     * owner_since / operator_since take precedence over the generic start_date.
     */
    public function getEffectiveStartDateAttribute(): ?\Carbon\Carbon
    {
        $role = strtolower($this->role ?? '');
        if (str_contains($role, 'operator')) {
            return $this->operator_since ?? $this->start_date;
        }
        return $this->owner_since ?? $this->start_date;
    }

    public function scopeActive($query)
    {
        return $query->where('is_closed', false);
    }

    public function scopeClosed($query)
    {
        return $query->where('is_closed', true);
    }

    public function scopeOwners($query)
    {
        return $query->whereRaw('LOWER(role) LIKE ?', ['%owner%']);
    }

    public function scopeOperators($query)
    {
        return $query->whereRaw('LOWER(role) LIKE ?', ['%operator%']);
    }

    public function aircraft()
    {
        return $this->belongsTo(Aircraft::class, 'aircraft_registration_id', 'empic_id');
    }

    public function owner()
    {
        return $this->belongsTo(Owner::class, 'owner_empic_id', 'empic_id');
    }
}
