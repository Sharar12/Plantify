<?php

namespace App\Services;

class DeliveryZoneCalculator
{
    public static function calculate(string $zone): array
    {
        $dhakaZones = ['uttara', 'gulshan', 'banani', 'dhanmondi', 'mirpur', 'bashundhara'];
        $isDhaka = in_array(strtolower(trim($zone)), $dhakaZones);

        if ($isDhaka) {
            return [
                'charge' => 70.0,
                'estimated_days' => '1-2 Days (Hand-Carried Dispatch)',
                'safe_for_fragile_ceramics' => true,
            ];
        }

        return [
            'charge' => 130.0,
            'estimated_days' => '3-4 Days (Cushioned Plywood Box)',
            'safe_for_fragile_ceramics' => false,
        ];
    }
}
