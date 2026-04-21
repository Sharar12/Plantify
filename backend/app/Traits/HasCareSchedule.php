<?php

namespace App\Traits;

trait HasCareSchedule
{
    public function getWateringDaysInterval(): int
    {
        return match($this->watering_frequency ?? 'weekly') {
            'daily' => 1,
            'biweekly' => 3,
            'weekly' => 7,
            'dry_out' => 12,
            default => 7,
        };
    }
}
