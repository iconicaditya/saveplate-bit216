import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateToken } from '@/lib/auth-middleware';

function getAuthUser(req: NextRequest) {
  const user = authenticateToken(req);
  if (!user) {
    return null;
  }
  return user;
}

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const storage = searchParams.get('storage');
    const status = searchParams.get('status');
    const expiry = searchParams.get('expiry');
    const search = searchParams.get('search');

    const where: any = { userId: user.id };

    if (category && category !== 'All') where.category = category;
    if (storage && storage !== 'All') where.storage = storage;
    if (status && status !== 'All') where.status = status;

    if (expiry) {
      const now = new Date();
      let endDate: Date;
      switch (expiry) {
        case 'Today':
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          where.expiryDate = { lte: endDate };
          break;
        case 'This Week':
          endDate = new Date(now);
          endDate.setDate(endDate.getDate() + (7 - endDate.getDay()));
          endDate.setHours(23, 59, 59, 999);
          where.expiryDate = { lte: endDate };
          break;
        case 'This Month':
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          where.expiryDate = { lte: endDate };
          break;
      }
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const items = await prisma.foodItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.foodItem.count({ where: { userId: user.id } });

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error('GET /api/inventory error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const { name, category, quantity, unit, expiryDate, storage, notes, imageUrl } = await req.json();

    if (!name || !quantity || !expiryDate) {
      return NextResponse.json({ error: 'Name, quantity, and expiry date are required.' }, { status: 400 });
    }

    // Defensive FK fix: ensure the JWT user actually exists in the database.
    // If not (e.g. token from a wiped/reset database, or a stale session), the
    // FoodItem insert would otherwise fail with P2003 FoodItem_userId_fkey.
    const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!existingUser) {
      console.error(`POST /api/inventory: JWT references missing user ${user.id} (${user.email})`);
      return NextResponse.json(
        { error: 'Your session is out of date. Please log out and log in again.' },
        { status: 401 }
      );
    }

    const expiry = new Date(expiryDate);
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    let status = 'Fresh';
    if (expiry < now) {
      status = 'Expired';
    } else if (expiry <= threeDaysFromNow) {
      status = 'Expiring Soon';
    }

    const item = await prisma.foodItem.create({
      data: {
        name,
        category: category || 'Other',
        quantity,
        unit: unit || 'items',
        expiryDate: expiry,
        storage: storage || 'Fridge',
        status,
        notes: notes || null,
        imageUrl: imageUrl || null,
        userId: existingUser.id,
      },
    });

    // Auto-create notification for expiring soon items
    if (status === 'Expiring Soon') {
      await prisma.notification.create({
        data: {
          type: 'alert',
          title: 'Items Expiring Soon',
          message: `${name} is expiring on ${expiry.toLocaleDateString()}. Use it or freeze it.`,
          userId: existingUser.id,
        },
      });
    }

    return NextResponse.json({ item, message: 'Food item added successfully!' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/inventory error:', error);
    return NextResponse.json({ error: 'Failed to add food item.' }, { status: 500 });
  }
}
