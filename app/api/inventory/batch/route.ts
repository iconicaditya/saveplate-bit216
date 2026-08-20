import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateToken } from "@/lib/auth-middleware";

export async function DELETE(req: NextRequest) {
  const user = authenticateToken(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "An array of item IDs is required." }, { status: 400 });
    }

    // Ensure users can only delete their own items
    const deleteResult = await prisma.foodItem.deleteMany({
      where: {
        id: { in: ids },
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: `Successfully deleted ${deleteResult.count} items.`,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error("DELETE /api/inventory/batch error:", error);
    return NextResponse.json({ error: "Failed to delete items." }, { status: 500 });
  }
}
