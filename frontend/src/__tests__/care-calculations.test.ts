import { formatWateringSchedule, formatPrice } from '../lib/formatters';
import { recommendPlantsFromQuiz } from '../lib/plant-quiz';

describe('Care & Price Calculation Formulas', () => {
  test('formats plant prices in Bangladeshi Taka', () => {
    expect(formatPrice(500)).toContain('500');
    expect(formatPrice(0)).toBe('Free');
  });

  test('formats watering cadence descriptions', () => {
    expect(formatWateringSchedule('daily')).toContain('morning');
    expect(formatWateringSchedule('dry_out')).toContain('completely dry');
  });

  test('recommends pet friendly plants when requested', () => {
    const res = recommendPlantsFromQuiz({
      sunlight: 'low',
      wateringHabit: 'forgetful',
      hasPets: true,
    });
    expect(res).toContain('Cast Iron Plant');
  });
});
