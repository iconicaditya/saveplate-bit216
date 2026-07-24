import { NextRequest, NextResponse } from 'next/server';
import * as otplib from 'otplib';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';
import { withAuth, AuthUser } from '@/lib/auth-middleware';

async function handler(req: NextRequest, user: AuthUser) {
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (dbUser.twoFAEnabled) {
    return NextResponse.json({ error: '2FA is already enabled.' }, { status: 400 });
  }

  const secret = otplib.generateSecret();
  const appName = process.env.TWO_FACTOR_APP_NAME || 'SavePlate';
  const otpauth = otplib.generateURI({
    strategy: 'totp',
    issuer: appName,
    label: dbUser.email,
    secret,
    algorithm: 'sha1',
    digits: 6,
    period: 30,
  });

  const qrCode = await QRCode.toDataURL(otpauth, {
    width: 200,
    margin: 2,
    color: { dark: '#1f2937', light: '#ffffff' },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFASecret: secret },
  });

  return NextResponse.json({ secret, qrCode, otpauth });
}

export const POST = withAuth(handler);