-- SavePlate Database Schema
-- PostgreSQL 16.x
-- Run this SQL in your Neon database console to create all tables

-- =============================================
-- Table: User
-- Stores registered user accounts
-- =============================================
-- ALTER TABLE "User" TO ADD NEW COLUMNS
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "profileImageUrl" TEXT,
ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "resetToken" TEXT,
ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);

-- IF you need to create the table from scratch instead, uncomment below:
/*
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "householdSize" TEXT NOT NULL,
    "location" TEXT,
    "profileImageUrl" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFAEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFASecret" TEXT,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
*/

-- Unique index on email for fast login lookups
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- =============================================
-- Table: VerificationToken
-- Stores OTP tokens for email verification and 2FA
-- =============================================
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- Index for looking up tokens by email and type (e.g., "email_verification")
CREATE INDEX "VerificationToken_email_type_idx" ON "VerificationToken"("email", "type");

-- Index for looking up by token value
CREATE INDEX "VerificationToken_token_idx" ON "VerificationToken"("token");

-- Foreign key from VerificationToken to User
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================
-- Table: PrivacySettings
-- Stores user privacy preferences (one-to-one with User)
-- =============================================
CREATE TABLE "PrivacySettings" (
    "id" TEXT NOT NULL,
    "publicProfile" BOOLEAN NOT NULL DEFAULT true,
    "showDonations" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "shareImpact" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PrivacySettings_pkey" PRIMARY KEY ("id")
);

-- One-to-one relationship with User
CREATE UNIQUE INDEX "PrivacySettings_userId_key" ON "PrivacySettings"("userId");

-- Foreign key from PrivacySettings to User (cascade delete)
ALTER TABLE "PrivacySettings" ADD CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;