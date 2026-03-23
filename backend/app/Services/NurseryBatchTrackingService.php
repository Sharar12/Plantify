<?php

namespace App\Services;

class NurseryBatchTrackingService
{
    public static function generateBatchCode(string $categoryCode, int $supplierId): string
    {
        $yearCode = date('y');
        $randomHash = strtoupper(substr(md5(uniqid()), 0, 4));
        return "NUR-{$categoryCode}-S{$supplierId}-{$yearCode}-{$randomHash}";
    }

    public static function isReadyForRetail(string $propagationDate, int $minMaturityDays = 45): bool
    {
        $diffDays = (time() - strtotime($propagationDate)) / (60 * 60 * 24);
        return $diffDays >= $minMaturityDays;
    }
}
