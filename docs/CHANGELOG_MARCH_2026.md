# Plantify — March 2026 Sprint Changelog

## 🚀 Milestones Delivered

### Botanical Catalog & UI Components
- Reusable `PlantTag`, `WateringIndicator`, `SunLightBadge`, `PlantCardSkeleton`, and `PlantEmptyState`.
- Interactive `PotSizeSelector` and `PlantCareAccordion` tabs.
- `PlantCareModal` notification reminder trigger and `BotanicalRatingStars`.
- Prototype `PlantDoctorChatDrawer` and `PlantAddonSelector`.

### Backend Architecture
- Standardized `ApiResponse` helper.
- `PlantDifficulty`, `LightLevel`, and `WaterFrequency` PHP 8.2 enums.
- Form Requests: `PlantStoreRequest`, `PlantCareGuideRequest`, `SpecialistConsultationRequest`, `PlantReviewRequest`.
- Query scopes and recommendation engines: `PlantFilterable`, `PlantRecommendationEngine`, `CareNotificationService`, `DeliveryZoneCalculator`.

### Taxonomy & Testing
- Unit test fixtures for care calculations and quiz algorithms.
- `MedicinalAndRarePlantsSeeder` with Aloe Vera and Tulsi.
- Complete documentation guides for architecture, plant care, payments, and specialist triage.
