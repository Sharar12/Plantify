export interface ClimateCheckResult {
  isSafe: boolean;
  status: 'optimal' | 'warning' | 'critical';
  recommendation: string;
}

export function evaluateRoomClimate(tempCelsius: number, humidityPercent: number): ClimateCheckResult {
  if (tempCelsius < 12) {
    return {
      isSafe: false,
      status: 'critical',
      recommendation: 'Cold shock hazard. Move tropical plants away from drafty windows.',
    };
  }

  if (tempCelsius > 36) {
    return {
      isSafe: false,
      status: 'warning',
      recommendation: 'Heat stress warning. Provide afternoon shade and increase misting.',
    };
  }

  if (humidityPercent < 40) {
    return {
      isSafe: true,
      status: 'warning',
      recommendation: 'Low humidity. Use pebble trays or humidifiers to prevent crispy leaf tips.',
    };
  }

  return {
    isSafe: true,
    status: 'optimal',
    recommendation: 'Optimal tropical climate conditions for lush leaf growth.',
  };
}
