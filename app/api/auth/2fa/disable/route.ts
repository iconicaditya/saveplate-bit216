import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { withAuth, AuthUser } from '@/lib/auth-middleware';

async function handler(req: NextRequest, user: AuthUser) {
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json({ error: 'Password is required to disable 2FA.' }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  const isPasswordValid = await bcrypt.compare(password, dbUser.password);
  if (!isPasswordValid) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFAEnabled: false, twoFASecret: null },
  });

  return NextResponse.json({ message: 'Two-factor authentication has been disabled.' });
}

export const POST = withAuth(handler);