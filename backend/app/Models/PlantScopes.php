<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

trait PlantScopes
{
    public function scopeIndoorOnly(Builder $query): Builder
    {
        return $query->where('light_requirement', '!=', 'high');
    }

    public function scopePetFriendly(Builder $query): Builder
    {
        return $query->where('is_pet_friendly', true);
    }

    public function scopeLowMaintenance(Builder $query): Builder
    {
        return $query->where('difficulty', 'easy')
                     ->whereIn('watering_frequency', ['weekly', 'dry_out']);
    }
}
