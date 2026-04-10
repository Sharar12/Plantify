<?php

namespace App\Services;

class PlantInventoryAlertService
{
    public const DEFAULT_RESTOCK_THRESHOLD = 5;

    public static function evaluateStock(int $currentStock, int $threshold = self::DEFAULT_RESTOCK_THRESHOLD): array
    {
        if ($currentStock <= 0) {
            return [
                'status' => 'out_of_stock',
                'alert' => 'Critical: Plant completely sold out. Immediate nursery re-stock needed.',
                'can_order' => false,
            ];
        }

        if ($currentStock <= $threshold) {
            return [
                'status' => 'low_stock',
                'alert' => "Warning: Only {$currentStock} units remaining in nursery.",
                'can_order' => true,
            ];
        }

        return [
            'status' => 'in_stock',
            'alert' => 'Stock healthy.',
            'can_order' => true,
        ];
    }
}
