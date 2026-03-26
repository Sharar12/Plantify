<?php

namespace App\Services;

class CareNotificationService
{
    public static function getSeasonalAdvice(int $month): string
    {
        return match($month) {
            3, 4, 5 => 'Spring/Summer: Plants enter active growth. Increase watering frequency and apply organic liquid fertilizer every 2-3 weeks.',
            6, 7, 8 => 'Monsoon Season: High ambient humidity. Ensure proper container drainage to prevent root rot. Do not overwater.',
            9, 10, 11 => 'Autumn Transition: Moderate watering. Wipe dust off leaves to optimize fading natural sunlight.',
            default => 'Winter Dormancy: Growth slows down. Water sparsely and move tropical plants away from cold drafts.',
        };
    }
}
