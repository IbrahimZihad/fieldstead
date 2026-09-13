# Fieldstead

Fieldstead is a full-stack e-commerce demo built for the Bangladeshi market, featuring a customer-facing storefront, an admin dashboard, and manual local payment options.

## Features

- 🛍️ **Storefront** — browse products, categories, and place orders
- 🔐 **Admin Dashboard** — manage products, categories, orders, and verify payments
- 💳 **Manual Payments** — Cash on Delivery, bKash, and Nagad (manual transfer verification instead of a payment gateway like SSLCommerz)
- ⚡ **Modern Stack** — type-safe frontend and backend built with TypeScript throughout

## Tech Stack

| Layer      | Technology                                  |
|------------|----------------------------------------------|
| Frontend   | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend    | Node.js, Express, TypeScript                |
| ORM        | Sequelize                                   |
| Database   | SQLite (default) — production DB planned on Aiven |

## Project Structure

```
fieldstead/
├── Fieldstead_frontend/   # Next.js frontend
├── Fieldstead_backend/    # Express backend API
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Backend Setup

```bash
cd Fieldstead_backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd Fieldstead_frontend
npm install
npm run dev
```

By default, the app uses SQLite for local development — no external database setup required to get started.

## Environment Variables

Create a `.env` file in the backend directory with the necessary configuration (database connection, ports, etc.) before running the app.

## Payments

Fieldstead does not use a third-party payment gateway. Instead, customers can:

1. Pay **Cash on Delivery**
2. Transfer via **bKash** or **Nagad** and submit a transaction ID
3. Admins verify the payment manually through the admin dashboard

## Roadmap

- [ ] Migrate production database to Aiven-hosted PostgreSQL/MySQL
- [ ] Add automated payment verification
- [ ] Expand admin analytics

## License

This project is currently unlicensed / private.
