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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
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
        emailVerified: user.emailVerified,
        twoFAEnabled: user.twoFAEnabled,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An error occurred during login.' }, { status: 500 });
  }
}