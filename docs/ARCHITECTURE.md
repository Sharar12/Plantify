# Plantify Platform Architecture & Domain Model

Plantify is an enterprise-grade full-stack plant e-commerce and care consultation platform built on Laravel 12 and Next.js 16.

## 🌿 Core Architecture
- **Backend**: Laravel 12 REST API with Sanctum authentication, modular services, and queue workers.
- **Frontend**: Next.js 16 (React 19) App Router, TypeScript, TailwindCSS v4, Lucide icons.
- **Database**: MySQL/MariaDB with strict relational integrity, foreign key cascades, and spatial indexes.
- **Payment Processing**: SSLCommerz gateway with hosted checkout and asynchronous IPN webhook handlers.

## 👥 Multi-Role User Hierarchy
1. **Customer**: Browse catalog, filter by sunlight/water, purchase plants/accessories, manage wishlists, request specialist consultation.
2. **Specialist (Botanist)**: Answer Q&A inquiries, provide personalized treatment plans, publish care guides.
3. **Delivery Staff**: Manage assigned dispatch queues, update transit checkpoints, verify OTP upon delivery.
4. **Administrator**: Global inventory management, SSLCommerz settlement verification, analytics dashboard.
