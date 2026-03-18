<?php

namespace App\Services;

class BotanicalFertilizerCalculator
{
    public static function calculateDose(int $potDiameterCm, string $growthStage = 'active'): array
    {
        $baseMl = max(1.0, round($potDiameterCm * 0.15, 1));

        if ($growthStage === 'dormant') {
            return [
                'dosage_ml' => 0.0,
                'frequency' => 'Do not fertilize during winter dormancy.',
                'npk_ratio' => 'None',
            ];
        }

        return [
            'dosage_ml' => $baseMl,
            'dilution_water_liters' => 1.0,
            'frequency' => 'Apply every 2-3 weeks with ordinary watering schedule.',
            'npk_ratio' => 'Balanced NPK 10-10-10 or 20-20-20 at half strength.',
        ];
    }
}
