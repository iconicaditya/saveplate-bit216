import { NextRequest, NextResponse } from 'next/server';
import * as otplib from 'otplib';
import prisma from '@/lib/prisma';
import { withAuth, AuthUser } from '@/lib/auth-middleware';

async function handler(req: NextRequest, user: AuthUser) {
  const { otp } = await req.json();

  if (!otp || otp.length !== 6) {
    return NextResponse.json({ error: 'A valid 6-digit code is required.' }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (!dbUser.twoFASecret) {
    return NextResponse.json({ error: '2FA has not been set up yet.' }, { status: 400 });
  }

  if (dbUser.twoFAEnabled) {
    return NextResponse.json({ error: '2FA is already enabled.' }, { status: 400 });
  }

  const isValid = await otplib.verify({ token: otp, secret: dbUser.twoFASecret });

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFAEnabled: true },
  });

  return NextResponse.json({ message: 'Two-factor authentication has been enabled successfully.' });
}

export const POST = withAuth(handler);