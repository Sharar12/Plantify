# Plantify — April 2026 Sprint Changelog

## 🌿 Spring Milestones Delivered

### Delivery Logistics & Dispatch Protocols
- Dynamic delivery estimate calculator (`estimateDelivery`) with Dhaka zone detection.
- `DELIVERY_PROTOCOL.md` establishing protective nursery packaging standards.
- `OrderTimelineTracker` visual progress bar with status checkpoints.
- `DeliveryStatus` and `SpecialistStatus` PHP 8.2 backed enums.
- Unit tests verifying Dhaka vs. Outside-Dhaka delivery tariff formulas.

### E-Commerce & Customer Delight
- `PlantHealthBadge` displaying nursery grade A+ certification.
- `PottingMixSelector` enabling customized soil mediums (Aroid chunky mix, gritty cactus blend).
- `EcoFriendlyPackagingToggle` for plastic-free biodegradable deliveries.
- `GiftPlantMessageCard` for greeting notes attached to delivered plants.
- `PlantCompareModal` for side-by-side botanical comparisons.
- `PlantCareFAQ` interactive accordion component.

### Security, Roles & Payments
- Comprehensive `RBAC_MATRIX.md` defining permissions across 4 user roles.
- `SslcommerzWebhookHandler` and IPN signature validation.
- `InvoiceGeneratorService` generating formatted invoices upon successful settlement.
