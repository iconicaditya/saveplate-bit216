import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateToken } from '@/lib/auth-middleware';

function getAuthUser(req: NextRequest) {
  const user = authenticateToken(req);
  if (!user) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');

    const where: any = { userId: user.id };

    if (filter === 'unread') where.read = false;
    if (filter === 'read') where.read = true;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const { id, markAll } = await req.json();

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ message: 'All notifications marked as read.' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required.' }, { status: 400 });
    }

    const existing = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Notification not found.' }, { status: 404 });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('POST /api/notifications error:', error);
    return NextResponse.json({ error: 'Failed to update notification.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required.' }, { status: 400 });
    }

    const existing = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Notification not found.' }, { status: 404 });
    }

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({ message: 'Notification deleted.' });
  } catch (error) {
    console.error('DELETE /api/notifications error:', error);
    return NextResponse.json({ error: 'Failed to delete notification.' }, { status: 500 });
  }
}