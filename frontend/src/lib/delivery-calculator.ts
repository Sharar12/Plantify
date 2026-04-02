export interface DeliveryEstimate {
  charge: number;
  timeframe: string;
  isInsideDhaka: boolean;
}

export function estimateDelivery(zone: string): DeliveryEstimate {
  const inside = [
    'uttara', 'mirpur', 'gulshan', 'banani', 'dhanmondi', 'mohammadpur',
    'bashundhara', 'motijheel', 'badda', 'baridhara'
  ];
  const cleaned = zone.trim().toLowerCase();
  const isInsideDhaka = inside.some((z) => cleaned.includes(z));

  if (isInsideDhaka) {
    return {
      charge: 70,
      timeframe: '24-48 Hours (Eco Hand-Delivery)',
      isInsideDhaka: true,
    };
  }

  return {
    charge: 130,
    timeframe: '3-5 Business Days (Protective Wooden Crates)',
    isInsideDhaka: false,
  };
}
