# Fieldstead — Simple E-Commerce App

A full-stack e-commerce example with an admin dashboard and manual (non-gateway)
payments:

- **backend/** — Node.js + TypeScript + Express + Sequelize (SQLite, zero-config), JWT auth
- **frontend/** — Next.js (App Router) + TypeScript + Tailwind CSS

Features: product catalog with categories, product detail pages, a
localStorage-backed cart, registration/login, checkout with a choice of
**Cash on Delivery**, **bKash (manual transfer)**, or **Nagad (manual
transfer)**, an order history page, and a full **admin dashboard** for
managing products, categories, orders, and payment verification.

## 1. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed   # creates the SQLite DB and fills it with sample data + 2 sample orders
npm run dev    # starts the API on http://localhost:5000
```

The seeder creates two accounts:

| Role     | Email                | Password    |
| -------- | --------------------- | ----------- |
| Admin    | admin@example.com     | admin123    |
| Customer | customer@example.com  | customer123 |

The database is a single SQLite file at `backend/data/database.sqlite` — no
external database server required. To switch to MySQL or PostgreSQL for a
production-like setup, see the comment at the top of
`backend/src/config/database.ts`; Sequelize supports both with a small config
change.

### API overview

| Method | Route                       | Auth        | Description                    |
| ------ | ---------------------------- | ----------- | -------------------------------|
| POST   | /api/auth/register            | –           | Create an account               |
| POST   | /api/auth/login               | –           | Log in, get a JWT               |
| GET    | /api/auth/me                  | user        | Current user                    |
| GET    | /api/products                 | –           | List products (search/category/pagination via query params) |
| GET    | /api/products/:idOrSlug       | –           | Product detail                  |
| POST   | /api/products                 | admin       | Create product                  |
| PUT    | /api/products/:id             | admin       | Update product                  |
| DELETE | /api/products/:id             | admin       | Delete product                  |
| GET    | /api/categories                | –           | List categories                 |
| POST   | /api/categories                | admin       | Create category                 |
| PUT    | /api/categories/:id            | admin       | Update category                 |
| DELETE | /api/categories/:id            | admin       | Delete category (blocked if products use it) |
| POST   | /api/orders                    | user        | Place an order — checks & decrements stock, records payment method |
| GET    | /api/orders/my                 | user        | Current user's orders           |
| GET    | /api/orders                    | admin       | All orders                      |
| PUT    | /api/orders/:id/status         | admin       | Update fulfillment status (pending/processing/shipped/delivered/cancelled) |
| PUT    | /api/orders/:id/payment         | admin       | Update payment status (unpaid/pending_verification/paid) |
| GET    | /api/admin/stats                | admin       | Dashboard totals: revenue, orders, products, customers, pending payments |

### Payments

There's no payment gateway wired up. Instead, checkout offers three methods:

- **Cash on delivery** — order is placed with `paymentStatus: unpaid`; an
  admin marks it `paid` once cash is collected.
- **bKash / Nagad (manual transfer)** — the customer sends money to a
  merchant number shown at checkout, then submits the transaction ID and the
  phone number they paid from. The order is placed with
  `paymentStatus: pending_verification`. An admin reviews it in
  **Admin → Orders** (transaction ID and phone are shown there) and marks it
  `paid` once verified against the bKash/Nagad merchant statement.

The merchant number shown at checkout is a placeholder
(`frontend/src/app/cart/page.tsx`, `MERCHANT_NUMBERS`) — replace it with a
real one before using this for anything but a demo.

## 2. Frontend setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev    # starts the site on http://localhost:3000
```

Make sure the backend is running first — `NEXT_PUBLIC_API_URL` in
`.env.local` should point at it (defaults to `http://localhost:5000/api`).

## 3. Try it out

**Shopper flow**
1. Visit `http://localhost:3000`, browse products, filter by category.
2. Add a few items to the cart (persisted in the browser).
3. Go to `/cart`, sign in or register, enter a shipping address, choose a
   payment method, and place the order.
4. Check `/orders` for order status and payment status.

**Admin flow**
1. Sign in with the admin account (`admin@example.com` / `admin123`).
2. Click **Admin** in the nav, or visit `/admin`.
3. **Overview** — revenue, order counts, low-stock and pending-payment alerts.
4. **Products** — create, edit, delete products.
5. **Categories** — create/delete categories.
6. **Orders** — filter to "Needs verification", check the transaction ID and
   sender phone against your bKash/Nagad statement, then mark the payment
   `paid` and move the order through its fulfillment states.

The `/admin` section is guarded client-side by checking the signed-in user's
role; all the actual enforcement happens server-side via the `requireAdmin`
middleware on every admin API route, so it's safe even if someone bypasses
the UI.

## Notes

- Passwords are hashed with bcrypt; sessions use JWTs (`JWT_SECRET` in
  `backend/.env` — change it before deploying anywhere real).
- Intentionally simple: no image uploads (seed data and the product form use
  photo URLs), no email notifications, no customer-facing "my account" page
  beyond order history. Natural next additions if you want to extend it.
