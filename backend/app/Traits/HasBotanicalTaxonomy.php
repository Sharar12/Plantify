<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait HasBotanicalTaxonomy
{
    public function scopeByBotanicalFamily(Builder $query, string $family): Builder
    {
        return $query->where('botanical_family', 'like', "%{$family}%");
    }

    public function scopeAroids(Builder $query): Builder
    {
        return $query->where('botanical_family', 'Araceae');
    }

    public function scopeSucculents(Builder $query): Builder
    {
        return $query->whereIn('botanical_family', ['Crassulaceae', 'Cactaceae', 'Asphodelaceae']);
    }
}
