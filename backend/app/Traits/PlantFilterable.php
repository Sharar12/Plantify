<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait PlantFilterable
{
    public function scopeFilterCatalog(Builder $query, array $filters = []): Builder
    {
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('scientific_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['light'])) {
            $query->where('light_requirement', $filters['light']);
        }

        if (!empty($filters['watering'])) {
            $query->where('watering_frequency', $filters['watering']);
        }

        if (isset($filters['pet_friendly'])) {
            $query->where('is_pet_friendly', filter_var($filters['pet_friendly'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query;
    }
}
