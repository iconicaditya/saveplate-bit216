import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthUser } from '@/lib/auth-middleware';

async function handler(req: NextRequest, user: AuthUser) {
  if (req.method === 'GET') {
    const settings = await prisma.privacySettings.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      settings: settings || {
        publicProfile: true,
        showDonations: true,
        marketingEmails: false,
        shareImpact: true,
      },
    });
  }

  const { publicProfile, showDonations, marketingEmails, shareImpact } = await req.json();

  const data: Record<string, boolean> = {};
  if (typeof publicProfile === 'boolean') data.publicProfile = publicProfile;
  if (typeof showDonations === 'boolean') data.showDonations = showDonations;
  if (typeof marketingEmails === 'boolean') data.marketingEmails = marketingEmails;
  if (typeof shareImpact === 'boolean') data.shareImpact = shareImpact;

  const settings = await prisma.privacySettings.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });

  return NextResponse.json({ message: 'Privacy settings saved successfully.', settings });
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);