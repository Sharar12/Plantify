# 🌿 Plantify

> **Bring nature home — a full-stack plant e-commerce platform built with Laravel 12 and Next.js 16.**

Plantify is a complete, role-aware web application that lets customers browse and buy plants, ask specialists for advice, admins to manage inventory & orders, and delivery agents to track shipments — all in one beautiful flow. It comes with cart, wishlist, reviews, Q&A, an internal inbox, and a real **SSLCommerz** payment gateway integrated for the Bangladesh market.

This monorepo houses two independently runnable apps — a **Laravel 12 REST API** and a **Next.js 16 (React 19) web client** — together with a pre-seeded MySQL/MariaDB dump and reference screenshots.

<p align="left">
  <img alt="Status" src="https://img.shields.io/badge/status-active-22c55e?style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-0ea5e9?style=flat-square" />
  <img alt="Repo" src="https://img.shields.io/badge/GitHub-Sharar12%2FPlantify-181717?style=flat-square&logo=github" />
  <img alt="Built with" src="https://img.shields.io/badge/powered%20by-coffee%20%26%20chlorophyll-16a34a?style=flat-square" />
</p>

---

## 📸 Screenshots

A glimpse of the storefront and dashboard experience.

|  |  |  |  |
| :---: | :---: | :---: | :---: |
| ![Plantify hero](./images/download.jpg) | ![Browse plants](./images/download%20(1).jpg) | ![Plant detail](./images/download%20(2).jpg) | ![Listing](./images/download%20(3).jpg) |
| ![Cart & checkout](./images/download%20(4).jpg) | ![Admin dashboard](./images/download%20(5).jpg) | ![Orders](./images/download%20(6).jpg) | ![Specialist Q&A](./images/download%20(7).jpg) |
| ![Inbox](./images/download%20(8).jpg) | ![Mobile](./images/download%20(9).jpg) | ![Payments](./images/download%20(10).jpg) |  |

> 📷 High-resolution raw images live under [`images/`](./images). Drop new screenshots in there and reference them as `![Caption](./images/your-file.jpg)`.

---

## ✨ Features

Plantify ships with rich functionality for every actor in the marketplace.

### 🛍 Customer
- Browse an attractive, responsive catalog of plants.
- View rich product pages with descriptions, care tips, gallery, reviews and Q&A.
- Save favourites to a personal **wishlist**.
- Add items to the cart and place orders quickly.
- Pay seamlessly via integrated **SSLCommerz**.
- Track order status (Pending → Processing → Shipped → Delivered, or Cancelled).
- Receive automatic refund confirmation messages in the **inbox**.

### 🛠 Admin
- Manage **users** (CRUD across all roles).
- Manage **categories** and **plant listings** (CRUD with multi-image upload).
- Adjust plant stock, prices, descriptions and care tips.
- View all orders and update statuses (with refund handling).
- Access an **analytics** dashboard for business insight.

### 🌱 Specialist
- View all pending consumer questions.
- Reply to questions to assist shoppers in plant selection.

### 🚚 Delivery
- View assigned/pending shipments.
- Update delivery status (Out for delivery → Delivered), instantly reflected for the customer.

### 🧰 Platform Features
- 🔎 **Search & Filters** by category and name.
- 🛒 **Persistent Cart** and ❤️ **Wishlist**.
- ⭐ **Star Reviews** with comments.
- ❓ **Q&A** between customers and specialists.
- 💳 **SSLCommerz** payment with sandbox/live toggle and IPN validation.
- 📬 **Inbox system** for automated notifications, refunds, and status updates.
- 🖼 **Multi-image uploads** for plant galleries.
- 🔐 **Role-based authentication** (`customer`, `admin`, `specialist`, `delivery`).

---

## 💻 Tech Stack

### Backend (API) — `backend/`
<div>
  <img alt="Laravel 12" src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" />
  <img alt="PHP 8.2" src="https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php&logoColor=white" />
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img alt="MariaDB" src="https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white" />
  <img alt="SSLCommerz" src="https://img.shields.io/badge/SSLCommerz-Payments-0ea5e9?style=for-the-badge&logo=money&logoColor=white" />
  <img alt="Composer" src="https://img.shields.io/badge/Composer-885630?style=for-the-badge&logo=composer&logoColor=white" />
</div>

### Frontend (Web) — `frontend/`
<div>
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img alt="ESLint 9" src="https://img.shields.io/badge/ESLint-9-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" />
</div>

### Tooling
<div>
  <img alt="Git" src="https://img.shields.io/badge/Git-F05033?style=for-the-badge&logo=git&logoColor=white" />
  <img alt="XAMPP" src="https://img.shields.io/badge/XAMPP-Apache%20%2B%20MySQL-FB7F24?style=for-the-badge&logo=apache&logoColor=white" />
  <img alt="VS Code" src="https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white" />
</div>

---

## 🏗 Architecture & Folder Structure

A clean monorepo: two independent projects share neither build pipeline nor runtime — they communicate via JSON over HTTP.

```text
Plantify/
├── backend/                  # Laravel 12 REST API
│   ├── app/
│   │   ├── Http/Controllers/ # Auth, Plants, Orders, Payment, Wishlist, ...
│   │   └── Models/           # User, Plant, Order, OrderItem, Category, Review, ...
│   ├── config/sslcommerz.php # Payment gateway configuration
│   ├── database/migrations/  # 20+ migrations
│   ├── routes/api.php        # All REST routes
│   └── .env.example
│
├── frontend/                 # Next.js 16 (App Router) + React 19
│   ├── src/app/              # Routes: /, /plants, /plant/[id], /cart, /checkout, /admin, ...
│   ├── src/components/       # Header, PlantCard, ...
│   └── package.json
│
├── database/
│   └── nextjs_plantify.sql   # Pre-seeded DB dump (8 plants, demo users, orders, reviews)
│
└── images/                   # Documentation screenshots used in this README
    ├── download.jpg
    └── download (1).jpg ... download (10).jpg
```

---

## 🚀 Getting Started

### Prerequisites
- **PHP 8.2+** with Composer
- **Node.js 18+** with npm
- **MySQL** or **MariaDB** (or SQLite for quick testing)
- Optional but recommended: **XAMPP** for a turnkey Apache + MySQL environment

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Sharar12/Plantify.git
cd Plantify
```

### 2️⃣ Start the Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Configure your DB in .env (see "Database Setup" section)
php artisan migrate --seed

# Serve the API on http://localhost:8000
php artisan serve
```

### 3️⃣ Start the Frontend (Next.js)
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:3000** 🌐

> ⚠️ **CORS:** Update `backend/config/cors.php` to allow `http://localhost:3000` so the SPA can call the API. The default Laravel 12 config usually allows this, but verify if you see CORS errors.

---

## 🗄 Database Setup

You have two paths; pick whichever you prefer.

**Option A — MySQL / MariaDB (recommended)**
1. Create an empty database called `nextjs_plantify` in phpMyAdmin or via CLI.
2. Import the provided SQL dump:
   ```bash
   mysql -u root -p nextjs_plantify < ../database/nextjs_plantify.sql
   ```
3. Set in `backend/.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=nextjs_plantify
   DB_USERNAME=root
   DB_PASSWORD=
   ```

**Option B — SQLite (zero-config)**
1. In `backend/.env` set `DB_CONNECTION=sqlite`.
2. Create an empty file `backend/database/database.sqlite`.
3. Run `php artisan migrate --seed`.

Depending on how you boot the project you'll see one of two catalogs:

- **Fresh install (`php artisan migrate --seed`)** — `PlantSeeder` creates **11 plants** (Aloe Vera, Snake Plant, Monstera Deliciosa, Peace Lily, Jade Plant, Fiddle Leaf Fig, ZZ Plant, Pothos, Calathea Orbifolia, String of Pearls, Bird of Paradise). Admin & Delivery users are NOT created here — see the **Default Test Accounts** table below.
- **SQL dump import** — `database/nextjs_plantify.sql` ships **7 plants** (6 named + 1 test row), plus pre-existing orders, reviews, categories and inbox messages so the UI has content to render immediately. It also pre-creates the Admin (`AA@gmail.com`), Delivery (`D@gmail.com`) and demo Customer (`A@gmail.com`) accounts you see in the table.

Either path is fully usable; the SQL dump just gives you a richer "looks-already-populated" demo.

---

## 💳 Payment Gateway (SSLCommerz)

Plantify integrates **SSLCommerz** end-to-end. The configuration lives in `backend/config/sslcommerz.php` and is fully controlled via `.env`.

```env
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWORD=qwerty
SSLCOMMERZ_MODE=sandbox

SSLCOMMERZ_SUCCESS_URL=http://localhost:3000/payment/success
SSLCOMMERZ_FAIL_URL=http://localhost:3000/payment/fail
SSLCOMMERZ_CANCEL_URL=http://localhost:3000/payment/cancel
SSLCOMMERZ_WEBHOOK_URL=http://localhost:8000/api/payment/ipn
```

- The default **sandbox** mode redirects users to the SSLCommerz sandbox and auto-verifies on the testbox credentials.
- Switch to **live** mode by creating a real merchant account at [sslcommerz.com](https://www.sslcommerz.com/) and replacing the credentials.
- The `success` callback validates `val_id` against the SSL Commerz validation API; `ipn` is the asynchronous notification webhook.

---

## 🔑 Default Test Accounts

After running the seeders / importing the SQL dump, you can sign in as any of these roles to explore role-specific flows.

| 🏷 Role | 📧 Email | 🔒 Dev Password | 📱 Phone |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `AA@gmail.com` | `11111111` | `9876543210` |
| 🌱 **Specialist** | `p@gmail.com` | `11111111` | `1234567890` |
| 🚚 **Delivery** | `D@gmail.com` | `11111111` | `1234567890` |
| 🧪 **Test Customer** | `test@example.com` | `password` | — |
| 🛒 **Demo Customer (SQL dump only)** | `A@gmail.com` | _unknown — registered via `/register` before the dump was taken; re-create your own with the same role to test_ | `11111112` |

> ⚠️ These are **DEFAULT DEV CREDENTIALS shipped with the seeders** — change them in production. To regenerate a password, run `php artisan tinker` → `Hash::make('your-new-password')` and update the user's `password` field.

> 💡 **Quick demo tip** — out of the box, only `p@gmail.com` (Specialist) and `test@example.com` (Test Customer) get seeded by `php artisan migrate --seed` because `backend/database/seeders/DatabaseSeeder.php` calls only `PlantSeeder`. To also get the Admin (`AA@gmail.com`) and Delivery (`D@gmail.com`) demo accounts, **either** run `php artisan db:seed --class=DeliveryUserSeeder` separately, **or** import `database/nextjs_plantify.sql` (which contains every demo user with the same password `11111111`).

---

## 🔌 API Reference

Base URL: `http://localhost:8000/api`

| Resource | Methods | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| Auth | `POST` | `/register`, `/login` | Register & sign in |
| Users | `GET POST PUT DELETE` | `/users`, `/users/{id}` | Admin user CRUD |
| Categories | `GET POST PUT DELETE` | `/categories`, `/categories/{id}` | Manage categories |
| Plants | `GET POST PUT DELETE` | `/plants`, `/plants/{id}` | Manage plant listings |
| Reviews | `GET POST` | `/plants/{id}/reviews` | Per-plant reviews |
| Questions | `GET POST` | `/plants/{id}/questions`, `/questions` | Q&A per plant |
| Answers | `POST` | `/questions/{id}/answer` | Specialist answers |
| Orders | `GET POST PUT` | `/orders`, `/orders/{id}/status` | Orders + status updates |
| Cancellations / Refunds | `POST` | `/orders/{id}/cancel` | Restocks and refunds |
| Inbox | `GET PUT DELETE` | `/messages`, `/messages/{id}/read` | Notify users |
| Wishlist | `GET POST DELETE` | `/wishlists`, `/wishlists/{plantId}` | Toggle favourites |
| Uploads | `POST` | `/upload` | Image hosting (multi-image) |
| Payments | `POST` | `/payment/init`, `/payment/success`, `/payment/ipn`, `/payment/cancel` | SSLCommerz callbacks |

A full request/response walkthrough is available in the `DOC/pdf_output.txt` directory in this repo.

---

## 🗺 Roadmap

Plantify is fully functional today, and the following improvements are planned:

- [ ] Robust Next.js middleware route guards per role (admin/specialist/delivery/customer)
- [ ] Real-time notifications via Laravel Reverb / WebSockets
- [ ] Richer analytics dashboards (Recharts / Chart.js) on `/admin/analytics`
- [ ] Move image storage to S3 / Cloudinary for production scaling
- [ ] Email & SMS order confirmations via SES / Twilio
- [ ] Internationalization (English + Bangla)
- [ ] Full Docker Compose stack for one-command development onboarding

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-plant`
3. Commit your changes: `git commit -m "feat: add amazing plant"`
4. Push to the branch: `git push origin feature/amazing-plant`
5. Open a Pull Request

---

## 📜 License

Released under the **MIT License**. See [`LICENSE`](./LICENSE) for the full text.

---

## ✍️ Author

**Sharar Hossain** — [@Sharar12](https://github.com/Sharar12) on GitHub

> 🪴 *Built as an internship portfolio piece showcasing modern full-stack web development — from RESTful API design and payment integration, to a fast, accessible React UI.*

---

<sub>Made with 💚 &nbsp;·&nbsp; Star ⭐ this repo if Plantify helped you sprout something green.</sub>
