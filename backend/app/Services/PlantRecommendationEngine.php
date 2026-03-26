<?php

namespace App\Services;

class PlantRecommendationEngine
{
    public static function matchByRoom(string $roomType, string $windowDirection): array
    {
        $directionMap = [
            'north' => 'low',
            'east' => 'medium',
            'west' => 'medium',
            'south' => 'high',
        ];

        $targetLight = $directionMap[strtolower($windowDirection)] ?? 'medium';

        return [
            'recommended_light' => $targetLight,
            'ideal_room' => ucfirst($roomType),
            'criteria' => "Selected for {$windowDirection}-facing windows in {$roomType}.",
        ];
    }
}
