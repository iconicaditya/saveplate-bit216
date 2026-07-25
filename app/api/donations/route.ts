import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateToken } from "@/lib/auth-middleware";

export async function GET(req: NextRequest) {
  const user = authenticateToken(req); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const params = new URL(req.url).searchParams; const mine = params.get("mine");
  const search = params.get("search") || ""; const category = params.getAll("category"); const storage = params.getAll("storage"); const expiry = params.get("expiry");
  const where: any = mine ? { OR: [{ donorId: user.id }, { claimantId: user.id }] } : { donorId: { not: user.id }, status: "AVAILABLE" };
  if (!mine) {
    where.foodItem = { status: { notIn: ["Expired", "Donated"] } };
    if (category.length) where.foodItem.category = { in: category };
    if (storage.length) where.foodItem.storage = { in: storage };
    if (search) where.foodItem.name = { contains: search, mode: "insensitive" };
    if (expiry && expiry !== "Any") {
      const now = new Date();
      const end = new Date();
      if (expiry === "Today") end.setHours(23, 59, 59, 999);
      else if (expiry === "This Week") end.setDate(end.getDate() + 7);
      else end.setMonth(end.getMonth() + 1);
      where.foodItem.expiryDate = { gte: now, lte: end };
    }
  }
  try {
    const donations = await prisma.donation.findMany({ where, orderBy: { updatedAt: "desc" }, include: { foodItem: true, donor: { select: { firstName: true, lastName: true, location: true, profileImageUrl: true } }, claimant: { select: { firstName: true, lastName: true, location: true, profileImageUrl: true } } } });
    const safeDonations = donations.map((donation) => ({ ...donation, pickupLocation: donation.status === "APPROVED" ? donation.pickupLocation : null }));
    return NextResponse.json({ donations: safeDonations, total: safeDonations.length });
  } catch (error) { console.error("GET /api/donations", error); return NextResponse.json({ error: "Failed to load donations." }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const user = authenticateToken(req); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const { foodItemId, pickupLocation, availability, notes } = await req.json();
    if (!foodItemId || !pickupLocation?.trim() || !availability?.trim()) return NextResponse.json({ error: "Item, pickup location, and availability are required." }, { status: 400 });
    const foodItem = await prisma.foodItem.findFirst({ where: { id: foodItemId, userId: user.id, status: { notIn: ["Expired", "Donated"] } } });
    if (!foodItem) return NextResponse.json({ error: "Only your unexpired inventory can be donated." }, { status: 400 });
    const active = await prisma.donation.findFirst({ where: { foodItemId, status: { in: ["AVAILABLE", "REQUESTED", "APPROVED"] } } });
    if (active) return NextResponse.json({ error: "This item already has an active listing." }, { status: 409 });
    const donation = await prisma.donation.create({ data: { foodItemId, donorId: user.id, pickupLocation: pickupLocation.trim(), availability: availability.trim(), notes: notes?.trim() || null } });
    return NextResponse.json({ donation, message: "Donation published successfully." }, { status: 201 });
  } catch (error) { console.error("POST /api/donations", error); return NextResponse.json({ error: "Failed to publish donation." }, { status: 500 }); }
}
