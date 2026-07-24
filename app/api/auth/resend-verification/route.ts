import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified.' }, { status: 400 });
    }

    await prisma.verificationToken.updateMany({
      where: { email, type: 'email_verification', used: false },
      data: { used: true },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { email, token: otp, type: 'email_verification', expiresAt, userId: user.id },
    });

    try {
      await sendVerificationEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to resend verification email:', emailError);
    }

    return NextResponse.json({ message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 });
  }
}