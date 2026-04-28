<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\DeliveryZoneCalculator;

class OrderCalculationTest extends TestCase
{
    public function test_dhaka_delivery_charge_is_70_taka(): void
    {
        $result = DeliveryZoneCalculator::calculate('Uttara');
        $this->assertEquals(70.0, $result['charge']);
        $this->assertTrue($result['safe_for_fragile_ceramics']);
    }

    public function test_outside_dhaka_delivery_charge_is_130_taka(): void
    {
        $result = DeliveryZoneCalculator::calculate('Chittagong');
        $this->assertEquals(130.0, $result['charge']);
        $this->assertFalse($result['safe_for_fragile_ceramics']);
    }
}
