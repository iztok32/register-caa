<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaxEntry extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'imported_at' => 'datetime',
        ];
    }

    public function getFullAddressAttribute(): string
    {
        return trim(implode(', ', array_filter([
            $this->street,
            trim("{$this->zip_code} {$this->city}"),
        ])));
    }

    public function scopeSearch($query, string $term)
    {
        $lower = mb_strtolower($term);
        return $query->where(function ($q) use ($lower) {
            $q->whereRaw('LOWER(name) LIKE ?', ["%{$lower}%"])
              ->orWhereRaw('LOWER(COALESCE(tax_number, \'\')) LIKE ?', ["%{$lower}%"])
              ->orWhereRaw('LOWER(COALESCE(registration_number, \'\')) LIKE ?', ["%{$lower}%"]);
        });
    }
}
