import { CURRENCY_SYMBOL } from "./constants";

export function formatPrice(amount: number): string {
  if (isNaN(amount) || amount === 0) return "Free";
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatWateringSchedule(frequency: string): string {
  switch (frequency) {
    case "daily": return "Water once every morning";
    case "biweekly": return "Water 2-3 times per week";
    case "weekly": return "Water once a week";
    case "dry_out": return "Water only when soil feels completely dry";
    default: return "Water as needed";
  }
}

export function formatPotDimensions(diameterCm: number, heightCm: number): string {
  return `${diameterCm} cm Ø × ${heightCm} cm H`;
}

export function formatRelativeCareTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
