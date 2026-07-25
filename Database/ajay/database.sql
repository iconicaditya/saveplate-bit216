-- SavePlate marketplace and meal planner extension (PostgreSQL 16+).
-- Prerequisites: run Database/aaditya/database.sql and Database/aakroshan/database.sql first.
-- This script is safe to rerun against an existing SavePlate database.

ALTER TABLE "FoodItem"
    ADD COLUMN IF NOT EXISTS "reservedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Profile fields used by registration and the authenticated application header.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileImageUrl" TEXT;

CREATE TABLE IF NOT EXISTS "Donation" (
    "id" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "claimantId" TEXT,
    "pickupLocation" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "claimedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Donation_foodItemId_key" UNIQUE ("foodItemId"),
    CONSTRAINT "Donation_status_check" CHECK ("status" IN ('AVAILABLE', 'REQUESTED', 'APPROVED', 'DECLINED', 'COMPLETED', 'CANCELLED'))
);
-- Upgrade databases created by an earlier version of this feature.
ALTER TABLE "Donation" DROP CONSTRAINT IF EXISTS "Donation_status_check";
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_status_check" CHECK ("status" IN ('AVAILABLE', 'REQUESTED', 'APPROVED', 'DECLINED', 'COMPLETED', 'CANCELLED'));
UPDATE "Donation" SET "status" = 'REQUESTED' WHERE "status" = 'CLAIMED';
CREATE INDEX IF NOT EXISTS "Donation_status_createdAt_idx" ON "Donation"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Donation_donorId_status_idx" ON "Donation"("donorId", "status");
CREATE INDEX IF NOT EXISTS "Donation_claimantId_status_idx" ON "Donation"("claimantId", "status");

CREATE TABLE IF NOT EXISTS "MealPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MealPlan_userId_weekStart_key" UNIQUE ("userId", "weekStart"),
    CONSTRAINT "MealPlan_status_check" CHECK ("status" IN ('DRAFT', 'CONFIRMED', 'CANCELLED'))
);
CREATE INDEX IF NOT EXISTS "MealPlan_userId_status_idx" ON "MealPlan"("userId", "status");

CREATE TABLE IF NOT EXISTS "PlannedMeal" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mealType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cookingTime" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlannedMeal_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PlannedMeal_plan_date_type_key" UNIQUE ("mealPlanId", "date", "mealType"),
    CONSTRAINT "PlannedMeal_type_check" CHECK ("mealType" IN ('Breakfast', 'Lunch', 'Dinner', 'Snack'))
);
CREATE INDEX IF NOT EXISTS "PlannedMeal_mealPlanId_date_idx" ON "PlannedMeal"("mealPlanId", "date");

CREATE TABLE IF NOT EXISTS "MealIngredient" (
    "id" TEXT NOT NULL,
    "plannedMealId" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL CHECK ("quantity" > 0),
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealIngredient_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MealIngredient_meal_item_key" UNIQUE ("plannedMealId", "foodItemId")
);
CREATE INDEX IF NOT EXISTS "MealIngredient_foodItemId_idx" ON "MealIngredient"("foodItemId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Donation_foodItemId_fkey') THEN ALTER TABLE "Donation" ADD CONSTRAINT "Donation_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Donation_donorId_fkey') THEN ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE CASCADE; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Donation_claimantId_fkey') THEN ALTER TABLE "Donation" ADD CONSTRAINT "Donation_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES "User"("id") ON DELETE SET NULL; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MealPlan_userId_fkey') THEN ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PlannedMeal_mealPlanId_fkey') THEN ALTER TABLE "PlannedMeal" ADD CONSTRAINT "PlannedMeal_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MealIngredient_plannedMealId_fkey') THEN ALTER TABLE "MealIngredient" ADD CONSTRAINT "MealIngredient_plannedMealId_fkey" FOREIGN KEY ("plannedMealId") REFERENCES "PlannedMeal"("id") ON DELETE CASCADE; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MealIngredient_foodItemId_fkey') THEN ALTER TABLE "MealIngredient" ADD CONSTRAINT "MealIngredient_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE RESTRICT; END IF;
END $$;
