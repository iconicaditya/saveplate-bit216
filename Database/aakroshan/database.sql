-- SavePlate Database Schema -- Food Inventory & Notifications
-- PostgreSQL 16.x
-- Run this SQL in your Neon database console to create the tables
-- Safe to re-run: uses IF NOT EXISTS to avoid errors
--
-- NOTE: User table is created separately (see Database/aaditya/database.sql).
-- This file only owns the FoodItem and Notification tables.

-- =============================================
-- Table: FoodItem
-- Stores food inventory items for each user
-- =============================================
CREATE TABLE IF NOT EXISTS "FoodItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'items',
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "storage" TEXT NOT NULL DEFAULT 'Fridge',
    "status" TEXT NOT NULL DEFAULT 'Fresh',
    "notes" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- Indexes for fast queries by user (IF NOT EXISTS for indexes)
CREATE INDEX IF NOT EXISTS "FoodItem_userId_idx" ON "FoodItem"("userId");
CREATE INDEX IF NOT EXISTS "FoodItem_userId_status_idx" ON "FoodItem"("userId", "status");
CREATE INDEX IF NOT EXISTS "FoodItem_userId_expiryDate_idx" ON "FoodItem"("userId", "expiryDate");

-- Foreign key from FoodItem to User (cascade delete)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FoodItem_userId_fkey') THEN
        ALTER TABLE "FoodItem" ADD CONSTRAINT "FoodItem_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- =============================================
-- Table: Notification
-- Stores user notifications (alerts, donations, system)
-- =============================================
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Notification_userId_fkey') THEN
        ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- =============================================
-- MIGRATION FIX: Add imageUrl column if missing
-- (Fix for existing databases created without this column)
-- =============================================
ALTER TABLE "FoodItem" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- =============================================
-- SEED DATA: Removed.
-- The previous seed inserted 10 food items into the first user found in
-- the "User" table. That was unsafe: if no user existed, the inserts were
-- skipped, but if a user was later registered their JWT id would not
-- match the seeded userId, causing foreign key violations on POST.
-- Inventory items are now created through the UI/API as the logged-in user.
-- =============================================
