export const SITE_NAME = "Plantify";
export const SITE_TAGLINE = "Breathe Life Into Your Space";
export const CURRENCY_SYMBOL = "৳";
export const DEFAULT_CURRENCY = "BDT";

export const PLANT_CATEGORIES = [
  { id: "indoor", name: "Indoor Plants", icon: "Home" },
  { id: "outdoor", name: "Outdoor Plants", icon: "Sun" },
  { id: "succulents", name: "Succulents & Cacti", icon: "Sparkles" },
  { id: "flowering", name: "Flowering Plants", icon: "Flower2" },
  { id: "medicinal", name: "Medicinal Herbs", icon: "HeartPulse" },
  { id: "pots", name: "Pots & Planters", icon: "Package" },
  { id: "fertilizers", name: "Fertilizers & Soil", icon: "Shovel" },
] as const;

export const LIGHT_LEVELS = [
  { value: "low", label: "Low Light", desc: "Tolerates shaded corners" },
  { value: "medium", label: "Indirect Light", desc: "Bright, filtered natural light" },
  { value: "high", label: "Direct Sunlight", desc: "6+ hours of full sun" },
] as const;

export const WATERING_FREQUENCIES = [
  { value: "daily", label: "Daily (Summer)", days: 1 },
  { value: "biweekly", label: "Every 2-3 Days", days: 3 },
  { value: "weekly", label: "Weekly", days: 7 },
  { value: "dry_out", label: "When Topsoil Dries", days: 10 },
] as const;

export const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Beginner Friendly", color: "emerald" },
  { value: "moderate", label: "Moderate Care", color: "amber" },
  { value: "expert", label: "Plant Parent Pro", color: "rose" },
] as const;
