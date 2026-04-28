import { evaluateRoomClimate } from '../lib/climate-utils';
import { estimateDelivery } from '../lib/delivery-calculator';

describe('Climate and Delivery Calculations', () => {
  test('flags cold shock under 12C', () => {
    const res = evaluateRoomClimate(10, 50);
    expect(res.status).toBe('critical');
    expect(res.isSafe).toBe(false);
  });

  test('approves optimal tropical climate', () => {
    const res = evaluateRoomClimate(25, 65);
    expect(res.status).toBe('optimal');
    expect(res.isSafe).toBe(true);
  });

  test('calculates correct inside-Dhaka delivery rate', () => {
    const del = estimateDelivery('Gulshan-2');
    expect(del.charge).toBe(70);
    expect(del.isInsideDhaka).toBe(true);
  });
});
