<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

trait CustomerCareScope
{
    public function scopeWithActiveCareReminders(Builder $query): Builder
    {
        return $query->whereHas('careReminders', function ($q) {
            $q->where('is_completed', false);
        });
    }
}
