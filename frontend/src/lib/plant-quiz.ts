export interface QuizAnswer {
  sunlight: "low" | "medium" | "high";
  wateringHabit: "frequent" | "forgetful";
  hasPets: boolean;
}

export function recommendPlantsFromQuiz(answers: QuizAnswer): string[] {
  if (answers.hasPets) {
    if (answers.wateringHabit === "forgetful") {
      return ["Cast Iron Plant", "Boston Fern"];
    }
    return ["Calathea Medallion", "Spider Plant"];
  }

  if (answers.wateringHabit === "forgetful") {
    return ["Snake Plant", "ZZ Plant", "Jade Succulent"];
  }

  return ["Monstera Deliciosa", "Pothos", "Peace Lily"];
}
