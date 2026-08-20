import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as otplib from 'otplib';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, password, twoFACode } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json({ error: 'Account locked due to too many failed attempts. Try again later or reset your password.' }, { status: 423 });
    }

    // Keep the auth response compatible while VS Code refreshes generated
    // Prisma declarations after the profile-field migration.
    const profileUser = user as typeof user & { location: string | null; profileImageUrl: string | null };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updates: any = { failedLoginAttempts: failedAttempts };

      if (failedAttempts >= 5) {
        const lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + 30); // Lock for 30 minutes
        updates.lockedUntil = lockedUntil;
      }

      await prisma.user.update({ where: { id: user.id }, data: updates });

      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Reset failed attempts on success
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
       await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
    }

    if (user.twoFAEnabled) {
      if (!twoFACode) {
        return NextResponse.json({
          requiresTwoFA: true,
          message: 'Two-factor authentication code required.',
          email: user.email,
        });
      }

      if (!user.twoFASecret) {
        return NextResponse.json({ error: '2FA is misconfigured.' }, { status: 400 });
      }

      const isValid2FA = await otplib.verify({ token: twoFACode, secret: user.twoFASecret });
      if (!isValid2FA) {
        return NextResponse.json({ error: 'Invalid two-factor authentication code.' }, { status: 401 });
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        householdSize: user.householdSize,
        location: profileUser.location,
        profileImageUrl: profileUser.profileImageUrl,
        emailVerified: user.emailVerified,
        twoFAEnabled: user.twoFAEnabled,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An error occurred during login.' }, { status: 500 });
  }
}
