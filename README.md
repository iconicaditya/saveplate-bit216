# SavePlate — Reduce Food Waste

SavePlate is a full-stack web application built with **Next.js** that helps households track their food inventory, donate surplus food, and plan meals — all in one place, so less food ends up in the bin.

## Group Assignment

This project was developed as a collaborative **group assignment** for **BIT 301 IT Project Management**. The project is planned, built, and tested as a team, with each member responsible for a specific set of features and their corresponding test suites.

### Group Members

| Name | Student ID | Responsibilities / Ownership |
| ---- | ---------- | ---------------------------- |
| Aaditya Chaudhary | E2300548 | Auth & Analytics (registration, 2FA, privacy, analytics) |
| Aakroshan Chaudhary | E2300551 | Inventory & Batch Operations (barcode auto-fill, batch deletion) |
| Ajay Kumar Goit | E2300553 | Marketplace & Recipe Matching (donations, meal planner) |

Each member owns a dedicated Playwright test suite under `tests/` that verifies their feature area (see the [Testing](#testing) section for details).

## Features

- **User Authentication**
  - Registration with email verification
  - Login with account lockout after failed attempts
  - Forgot / reset password flow
  - Two-factor authentication (2FA) via OTP (`otplib`, `qrcode`)
- **Dashboard** — overview of inventory, expiring items, and alerts.
- **Inventory Management** — add, edit, and delete food items, barcode auto-fill, and batch deletion.
- **Marketplace / Donations** — list and claim surplus food, interactive map view (Leaflet), and expiry-based claim release.
- **Meal Planner** — weekly meal planning with recipe matching and inventory reservation.
- **Analytics** — custom date-range analytics with CSV / PDF export.
- **Notifications** — expiry alerts and activity notifications.
- **Settings** — profile, household, privacy toggles, and security (password + 2FA management).

## Tech Stack

| Layer    | Technology |
| -------- | ---------- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling  | Tailwind CSS |
| Database | PostgreSQL via Prisma ORM |
| Auth / Security | bcryptjs, jsonwebtoken, otplib, qrcode |
| Mapping | Leaflet / react-leaflet |
| Exports | jspdf, html2canvas |
| Email | nodemailer (mocked for development) |
| Media | Cloudinary |
| Testing | Playwright (E2E) |

## Project Structure

```
app/            # Pages and API routes (App Router)
  (app)/        # Authenticated pages (dashboard, inventory, marketplace, meal planner, analytics, notifications, settings)
  api/          # Next.js API route handlers (auth, inventory, donations, meal-plans, notifications, upload, analytics)
  login/register/forgot-password/reset-password/
components/     # Reusable UI components (Navbar, Hero, Footer, DonationMap, RecipeSuggestions, ToastProvider)
lib/            # Shared utilities (prisma client, auth middleware, email, recipes, api helpers, cloudinary)
prisma/         # Prisma schema (PostgreSQL data model)
public/         # Static assets (logo, favicon, profile images, opengraph, robots.txt)
tests/          # Playwright E2E test suites
database.sql    # Complete PostgreSQL schema (run once for a new database)
```

## Prerequisites

- Node.js 18.18+ (or 20+)
- PostgreSQL (16+)
- npm

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file (or use the existing `.env.local`) with at least the following:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/saveplate?schema=public"
```

Additional optional variables used by the app include SMTP settings for `nodemailer` and Cloudinary credentials for media upload. In development, email delivery is simulated.

### 3. Set up the database

Either run the complete schema script (recommended for a fresh database):

```bash
psql -U <user> -d saveplate -f database.sql
```

or generate the Prisma client and sync the schema:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Build and start (production)

```bash
npm run build
npm run start
```

## Available Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the development server (Turbopack, port 3000) |
| `npm run build` | Generate Prisma client and build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test:e2e` | Run all Playwright E2E tests |
| `npm run test:aaditya` | Run the Aaditya-owned test suite |
| `npm run test:aakroshan` | Run the Aakroshan-owned test suite |
| `npm run test:ajay` | Run the Ajay-owned test suite |

## Testing

The project uses **Playwright** for end-to-end and API testing. Test suites live under `tests/` and are organized by owner:

| Owner | Test File | Coverage |
| ----- | --------- | -------- |
| Aaditya Chaudhary | `tests/aaditya/auth-analytics.spec.ts` | Auth & analytics (TC-27–TC-32) |
| Aakroshan Chaudhary | `tests/aakroshan/inventory-operations.spec.ts` | Inventory & batch operations (TC-33–TC-38) |
| Ajay Kumar Goit | `tests/ajay/marketplace-recipes.spec.ts` | Marketplace & recipe matching (TC-39–TC-44) |

Before running tests, start the app in a separate terminal with `npm run dev` (the shared `playwright.config.ts` expects it at `http://localhost:3000`), then run:

```bash
npm run test:e2e
```

Run a single suite: `npm run test:aaditya`, `npm run test:aakroshan`, or `npm run test:ajay`.

## Database Schema

The canonical data model is defined in `prisma/schema.prisma` and mirrored in the standalone PostgreSQL script `database.sql`. Core entities: `User`, `VerificationToken`, `PrivacySettings`, `FoodItem`, `Donation`, `MealPlan`, `PlannedMeal`, `MealIngredient`, and `Notification`.

## License

This project was built as part of an academic group assignment for **BIT 301 IT Project Management** (Software Engineering, BIT 216).
