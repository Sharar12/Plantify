import { useMemo } from 'react';

export interface PlantFilterItem {
  id: string | number;
  category: string;
  light: string;
  watering: string;
  isPetFriendly: boolean;
}

export function usePlantFilters<T extends PlantFilterItem>(
  plants: T[],
  filters: { category?: string; light?: string; petFriendlyOnly?: boolean }
) {
  return useMemo(() => {
    return plants.filter((plant) => {
      if (filters.category && plant.category !== filters.category) return false;
      if (filters.light && plant.light !== filters.light) return false;
      if (filters.petFriendlyOnly && !plant.isPetFriendly) return false;
      return true;
    });
  }, [plants, filters.category, filters.light, filters.petFriendlyOnly]);
}
