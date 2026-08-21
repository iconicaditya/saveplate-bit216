-- SavePlate complete PostgreSQL schema (PostgreSQL 16+)
-- Run this file once for a new database. Existing installations may also run it safely.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE, "password" TEXT NOT NULL, "householdSize" TEXT NOT NULL, "location" TEXT,
  "profileImageUrl" TEXT, "emailVerified" BOOLEAN NOT NULL DEFAULT false, "twoFAEnabled" BOOLEAN NOT NULL DEFAULT false,
  "twoFASecret" TEXT, "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0, "lockedUntil" TIMESTAMP(3),
  "resetToken" TEXT, "resetTokenExpiry" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileImageUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "User_resetToken_idx" ON "User"("resetToken");

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "email" TEXT NOT NULL, "token" TEXT NOT NULL, "type" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL, "used" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "VerificationToken_email_type_idx" ON "VerificationToken"("email", "type");
CREATE INDEX IF NOT EXISTS "VerificationToken_token_idx" ON "VerificationToken"("token");

CREATE TABLE IF NOT EXISTS "PrivacySettings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "publicProfile" BOOLEAN NOT NULL DEFAULT true,
  "showDonations" BOOLEAN NOT NULL DEFAULT true, "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
  "shareImpact" BOOLEAN NOT NULL DEFAULT true, "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "FoodItem" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "name" TEXT NOT NULL, "category" TEXT NOT NULL,
  "quantity" TEXT NOT NULL, "unit" TEXT NOT NULL DEFAULT 'items', "reservedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "expiryDate" TIMESTAMP(3) NOT NULL, "storage" TEXT NOT NULL DEFAULT 'Fridge', "status" TEXT NOT NULL DEFAULT 'Fresh',
  "notes" TEXT, "imageUrl" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);
ALTER TABLE "FoodItem" ADD COLUMN IF NOT EXISTS "reservedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "FoodItem" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
CREATE INDEX IF NOT EXISTS "FoodItem_userId_idx" ON "FoodItem"("userId");
CREATE INDEX IF NOT EXISTS "FoodItem_userId_status_idx" ON "FoodItem"("userId", "status");
CREATE INDEX IF NOT EXISTS "FoodItem_userId_expiryDate_idx" ON "FoodItem"("userId", "expiryDate");

CREATE TABLE IF NOT EXISTS "Donation" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "foodItemId" TEXT NOT NULL UNIQUE REFERENCES "FoodItem"("id") ON DELETE CASCADE,
  "donorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE, "claimantId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "pickupLocation" TEXT NOT NULL, "availability" TEXT NOT NULL, "notes" TEXT, "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "claimedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "Donation" DROP CONSTRAINT IF EXISTS "Donation_status_check";
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_status_check" CHECK ("status" IN ('AVAILABLE','REQUESTED','APPROVED','DECLINED','COMPLETED','CANCELLED'));
UPDATE "Donation" SET "status" = 'REQUESTED' WHERE "status" = 'CLAIMED';
CREATE INDEX IF NOT EXISTS "Donation_status_createdAt_idx" ON "Donation"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Donation_donorId_status_idx" ON "Donation"("donorId", "status");
CREATE INDEX IF NOT EXISTS "Donation_claimantId_status_idx" ON "Donation"("claimantId", "status");

CREATE TABLE IF NOT EXISTS "MealPlan" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "weekStart" DATE NOT NULL, "status" TEXT NOT NULL DEFAULT 'DRAFT', "confirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "weekStart"), CONSTRAINT "MealPlan_status_check" CHECK ("status" IN ('DRAFT','CONFIRMED','CANCELLED'))
);
CREATE INDEX IF NOT EXISTS "MealPlan_userId_status_idx" ON "MealPlan"("userId", "status");

CREATE TABLE IF NOT EXISTS "PlannedMeal" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "mealPlanId" TEXT NOT NULL REFERENCES "MealPlan"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL, "mealType" TEXT NOT NULL, "name" TEXT NOT NULL, "cookingTime" INTEGER, "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("mealPlanId", "date", "mealType"), CONSTRAINT "PlannedMeal_type_check" CHECK ("mealType" IN ('Breakfast','Lunch','Dinner','Snack'))
);
CREATE INDEX IF NOT EXISTS "PlannedMeal_mealPlanId_date_idx" ON "PlannedMeal"("mealPlanId", "date");

CREATE TABLE IF NOT EXISTS "MealIngredient" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "plannedMealId" TEXT NOT NULL REFERENCES "PlannedMeal"("id") ON DELETE CASCADE,
  "foodItemId" TEXT NOT NULL REFERENCES "FoodItem"("id") ON DELETE RESTRICT, "quantity" DECIMAL(10,2) NOT NULL CHECK ("quantity" > 0),
  "unit" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE("plannedMealId", "foodItemId")
);
CREATE INDEX IF NOT EXISTS "MealIngredient_foodItemId_idx" ON "MealIngredient"("foodItemId");

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, "type" TEXT NOT NULL, "title" TEXT NOT NULL, "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");
