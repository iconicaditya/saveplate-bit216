import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateToken } from '@/lib/auth-middleware';

function getAuthUser(req: NextRequest) {
  const user = authenticateToken(req);
  if (!user) return null;
  return user;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const { id: itemId } = await params;

    // Verify ownership
    const existing = await prisma.foodItem.findFirst({
      where: { id: itemId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Food item not found.' }, { status: 404 });
    }

    const { name, category, quantity, unit, expiryDate, storage, notes } = await req.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unit !== undefined) updateData.unit = unit;
    if (storage !== undefined) updateData.storage = storage;
    if (notes !== undefined) updateData.notes = notes;

    if (expiryDate !== undefined) {
      const expiry = new Date(expiryDate);
      updateData.expiryDate = expiry;

      const now = new Date();
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      if (expiry < now) {
        updateData.status = 'Expired';
      } else if (expiry <= threeDaysFromNow) {
        updateData.status = 'Expiring Soon';
      } else {
        updateData.status = 'Fresh';
      }
    }

    const item = await prisma.foodItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json({ item, message: 'Food item updated successfully!' });
  } catch (error) {
    console.error('PUT /api/inventory/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update food item.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const { id: itemId } = await params;

    // Verify ownership
    const existing = await prisma.foodItem.findFirst({
      where: { id: itemId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Food item not found.' }, { status: 404 });
    }

    await prisma.foodItem.delete({ where: { id: itemId } });

    return NextResponse.json({ message: 'Food item deleted successfully.' });
  } catch (error) {
    console.error('DELETE /api/inventory/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete food item.' }, { status: 500 });
  }
}