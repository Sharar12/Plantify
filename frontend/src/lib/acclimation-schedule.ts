export interface AcclimationStep {
  dayRange: string;
  action: string;
  warning: string;
}

export const NEW_PLANT_ACCLIMATION_STEPS: AcclimationStep[] = [
  {
    dayRange: "Days 1–3",
    action: "Unbox immediately upon courier arrival. Place in medium indirect light away from air conditioners or heating vents.",
    warning: "Do NOT place directly into blazing sunlight or repot immediately.",
  },
  {
    dayRange: "Days 4–7",
    action: "Inspect top 2 inches of soil moisture. Water thoroughly only if dry until water runs out bottom drainage hole.",
    warning: "Avoid fertilizers during this initial settling stage.",
  },
  {
    dayRange: "Days 8–14",
    action: "Gradually shift plant to its permanent intended location. Clean foliage with a damp cloth.",
    warning: "Watch for minor lower leaf yellowing as normal stress adjustment.",
  },
];
