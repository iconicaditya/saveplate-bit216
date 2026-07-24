import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        email,
        token: otp,
        type: 'email_verification',
        used: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
    }

    await prisma.verificationToken.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    });

    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    return NextResponse.json({
      message: 'Email verified successfully.',
      user: { id: user.id, email: user.email, emailVerified: true },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'An error occurred during email verification.' }, { status: 500 });
  }
}