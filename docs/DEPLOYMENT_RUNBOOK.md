# Plantify Monorepo Production Deployment Runbook

## 🌐 Frontend (Next.js 16)
- Deploy to Vercel or Node.js Docker runtime.
- Environment variables:
  `NEXT_PUBLIC_API_URL=https://api.plantify.com.bd/api`

## ⚙️ Backend (Laravel 12 API)
- Deploy on Ubuntu 24.04 LTS (Nginx, PHP 8.2-FPM, MariaDB).
- Ensure storage permissions:
  `chmod -R 775 storage bootstrap/cache`
- Setup Queue Worker with Supervisor for invoice emails & IPN webhooks.
