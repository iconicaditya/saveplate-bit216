import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthUser } from '@/lib/auth-middleware';

async function handler(req: NextRequest, user: AuthUser) {
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      householdSize: true,
      emailVerified: true,
      twoFAEnabled: true,
      createdAt: true,
      privacySettings: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  return NextResponse.json({ user: dbUser });
}

export const GET = withAuth(handler);