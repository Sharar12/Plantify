export type LightRequirement = "low" | "medium" | "high";
export type WaterFrequency = "daily" | "biweekly" | "weekly" | "dry_out";
export type DifficultyLevel = "easy" | "moderate" | "expert";

export interface PlantCareGuide {
  id: number;
  plantId: number;
  light: LightRequirement;
  watering: WaterFrequency;
  temperatureRange: string;
  humidityPercentage: string;
  soilType: string;
  fertilizerFrequency: string;
  petFriendly: boolean;
  toxicNotes?: string;
  repottingMonths: number;
}

export interface SpecialistConsultation {
  id: string;
  userId: string;
  specialistId?: string;
  plantName: string;
  symptoms: string[];
  photoUrls: string[];
  diagnosis?: string;
  recommendedTreatment?: string;
  status: "pending" | "diagnosed" | "resolved";
  createdAt: string;
  updatedAt: string;
}

export interface PlantScheduleReminder {
  id: string;
  plantId: number;
  plantName: string;
  taskType: "water" | "fertilize" | "prune" | "mist";
  nextDueAt: string;
  isCompleted: boolean;
}
