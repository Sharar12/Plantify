<?php

namespace App\Enums;

enum DeliveryStatus: string
{
    case ASSIGNED = 'assigned';
    case OUT_FOR_DELIVERY = 'out_for_delivery';
    case DELIVERED = 'delivered';
    case FAILED_ATTEMPT = 'failed_attempt';

    public function label(): string
    {
        return match($this) {
            self::ASSIGNED => 'Assigned to Courier',
            self::OUT_FOR_DELIVERY => 'Out for Hand-Delivery',
            self::DELIVERED => 'Delivered & Verified',
            self::FAILED_ATTEMPT => 'Recipient Unavailable',
        };
    }
}

enum SpecialistStatus: string
{
    case PENDING = 'pending';
    case IN_REVIEW = 'in_review';
    case RESOLVED = 'resolved';
}
