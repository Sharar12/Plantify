export interface LeafCareRecommendation {
  cleanIntervalDays: number;
  mistFrequencyPerWeek: number;
  recipe: string;
}

export function getLeafCareAdvice(hasAirConditioning: boolean, leafType: 'glossy' | 'velvet' | 'waxy'): LeafCareRecommendation {
  if (leafType === 'velvet') {
    return {
      cleanIntervalDays: 14,
      mistFrequencyPerWeek: 0,
      recipe: "Gently dust with a dry soft makeup brush. Do not spray water directly on velvet foliage to avoid fungal spotting.",
    };
  }

  const mistFreq = hasAirConditioning ? 4 : 2;

  return {
    cleanIntervalDays: 21,
    mistFrequencyPerWeek: mistFreq,
    recipe: "Wipe with a lukewarm damp microfiber cloth mixed with 1 drop of cold-pressed organic neem oil for natural shine.",
  };
}
