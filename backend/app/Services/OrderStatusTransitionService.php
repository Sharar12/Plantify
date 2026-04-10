<?php

namespace App\Services;

use InvalidArgumentException;

class OrderStatusTransitionService
{
    private static array $allowedTransitions = [
        'pending' => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped' => ['delivered', 'returned'],
        'delivered' => [],
        'cancelled' => [],
    ];

    public static function canTransition(string $current, string $target): bool
    {
        return in_array($target, self::$allowedTransitions[$current] ?? []);
    }

    public static function transition(string $current, string $target): string
    {
        if (!self::canTransition($current, $target)) {
            throw new InvalidArgumentException("Illegal order status transition from {$current} to {$target}");
        }
        return $target;
    }
}
