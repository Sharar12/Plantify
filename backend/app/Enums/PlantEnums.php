<?php

namespace App\Enums;

enum PlantDifficulty: string
{
    case EASY = 'easy';
    case MODERATE = 'moderate';
    case EXPERT = 'expert';

    public function label(): string
    {
        return match($this) {
            self::EASY => 'Beginner Friendly',
            self::MODERATE => 'Moderate Care',
            self::EXPERT => 'Plant Parent Pro',
        };
    }
}

enum LightLevel: string
{
    case LOW = 'low';
    case MEDIUM = 'medium';
    case HIGH = 'high';

    public function label(): string
    {
        return match($this) {
            self::LOW => 'Low Light',
            self::MEDIUM => 'Bright Indirect',
            self::HIGH => 'Full Sunlight',
        };
    }
}

enum WaterFrequency: string
{
    case DAILY = 'daily';
    case BIWEEKLY = 'biweekly';
    case WEEKLY = 'weekly';
    case DRY_OUT = 'dry_out';
}
