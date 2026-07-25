import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateToken } from "@/lib/auth-middleware";

const RANGE_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 };

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET(req: NextRequest) {
  const user = authenticateToken(req);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const params = new URL(req.url).searchParams;
  const range = params.get("range") || "30d";
  const category = params.get("category") || "All";
  const overview = params.get("overview") === "true";
  const days = RANGE_DAYS[range];

  if (!days) {
    return NextResponse.json({ error: "Unsupported analytics date range." }, { status: 400 });
  }

  try {
    const end = new Date();
    const start = startOfDay(new Date(end));
    start.setDate(start.getDate() - (days - 1));
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - days);
    const previousEnd = new Date(start);

    const itemCategoryFilter = category === "All" ? {} : { category };
    const dateWindow = { gte: start, lte: end };
    const previousWindow = { gte: previousStart, lt: previousEnd };

    const [
      addedItems,
      previousAddedItems,
      donatedItems,
      previousDonatedItems,
      receivedDonations,
      activeListings,
      nearExpiryItems,
      totalInventory,
      confirmedPlans,
      previousConfirmedPlans,
      completedMeals,
      categoryGroups,
      activityItems,
      donationActivity,
      upcomingExpiry,
      recentNotifications,
      recentDonations,
      draftMeals,
    ] = await Promise.all([
      prisma.foodItem.count({ where: { userId: user.id, ...itemCategoryFilter, createdAt: dateWindow } }),
      prisma.foodItem.count({ where: { userId: user.id, ...itemCategoryFilter, createdAt: previousWindow } }),
      prisma.donation.count({ where: { donorId: user.id, status: "COMPLETED", completedAt: dateWindow, ...(category === "All" ? {} : { foodItem: { category } }) } }),
      prisma.donation.count({ where: { donorId: user.id, status: "COMPLETED", completedAt: previousWindow, ...(category === "All" ? {} : { foodItem: { category } }) } }),
      prisma.donation.count({ where: { claimantId: user.id, status: "COMPLETED", completedAt: dateWindow, ...(category === "All" ? {} : { foodItem: { category } }) } }),
      prisma.donation.count({ where: { donorId: user.id, status: { in: ["AVAILABLE", "REQUESTED", "APPROVED"] } } }),
      prisma.foodItem.count({ where: { userId: user.id, status: "Expiring Soon" } }),
      prisma.foodItem.count({ where: { userId: user.id, status: { notIn: ["Donated", "Used", "Expired"] } } }),
      prisma.mealPlan.count({ where: { userId: user.id, status: "CONFIRMED", confirmedAt: dateWindow } }),
      prisma.mealPlan.count({ where: { userId: user.id, status: "CONFIRMED", confirmedAt: previousWindow } }),
      prisma.plannedMeal.count({ where: { mealPlan: { userId: user.id, status: "CONFIRMED", confirmedAt: dateWindow } } }),
      prisma.foodItem.groupBy({
        by: ["category"],
        where: { userId: user.id, ...itemCategoryFilter, createdAt: dateWindow },
        _count: { _all: true },
        orderBy: { _count: { category: "desc" } },
      }),
      prisma.foodItem.findMany({ where: { userId: user.id, ...itemCategoryFilter, createdAt: dateWindow }, select: { createdAt: true } }),
      prisma.donation.findMany({ where: { donorId: user.id, status: "COMPLETED", completedAt: dateWindow, ...(category === "All" ? {} : { foodItem: { category } }) }, select: { completedAt: true } }),
      prisma.foodItem.findMany({
        where: { userId: user.id, status: { notIn: ["Donated", "Used", "Expired"] }, expiryDate: { gte: startOfDay(new Date()) } },
        select: { id: true, name: true, storage: true, expiryDate: true, status: true },
        orderBy: { expiryDate: "asc" },
        take: 5,
      }),
      prisma.notification.findMany({
        where: { userId: user.id },
        select: { id: true, type: true, title: true, message: true, read: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.donation.findMany({
        where: { OR: [{ donorId: user.id }, { claimantId: user.id }] },
        select: { id: true, status: true, updatedAt: true, donorId: true, foodItem: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.plannedMeal.findMany({
        where: { mealPlan: { userId: user.id, status: "DRAFT" } },
        select: { id: true, name: true, date: true, mealType: true },
        orderBy: { date: "asc" },
        take: 3,
      }),
    ]);

    const bucketCount = days <= 30 ? Math.min(days, 14) : 12;
    const bucketSize = Math.ceil(days / bucketCount);
    const activity: { label: string; added: number; donated: number; total: number }[] = Array.from({ length: bucketCount }, (_, index) => {
      const bucketStart = new Date(start);
      bucketStart.setDate(bucketStart.getDate() + index * bucketSize);
      const bucketEnd = new Date(bucketStart);
      bucketEnd.setDate(bucketEnd.getDate() + bucketSize);
      const added = activityItems.filter(({ createdAt }) => createdAt >= bucketStart && createdAt < bucketEnd).length;
      const donated = donationActivity.filter(({ completedAt }) => completedAt && completedAt >= bucketStart && completedAt < bucketEnd).length;
      return { label: bucketStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }), added, donated, total: added + donated };
    });

    const categoryTotal = categoryGroups.reduce((total, group) => total + group._count._all, 0);
    const categoryBreakdown = categoryGroups.map((group) => ({
      name: group.category,
      count: group._count._all,
      percentage: categoryTotal ? Math.round((group._count._all / categoryTotal) * 100) : 0,
    }));

    const response = {
      filters: { range, category, start: start.toISOString(), end: end.toISOString() },
      overview: {
        totalInventory,
        nearExpiryItems,
        activeListings,
        completedDonations: donatedItems,
        completedMeals,
        upcomingExpiry,
        recentNotifications,
        recentDonations: recentDonations.map((donation) => ({
          ...donation,
          role: donation.donorId === user.id ? "donor" : "receiver",
        })),
        draftMeals,
      },
      metrics: {
        foodAdded: { value: addedItems, change: percentChange(addedItems, previousAddedItems), label: "inventory items added" },
        donationsMade: { value: donatedItems, change: percentChange(donatedItems, previousDonatedItems), label: "completed donations" },
        mealsPlanned: { value: completedMeals, change: percentChange(confirmedPlans, previousConfirmedPlans), label: "meals in confirmed plans" },
        foodRedirected: { value: donatedItems + receivedDonations, label: "completed community exchanges" },
      },
      activity,
      categoryBreakdown,
      milestones: [
        { title: "Waste Warrior", description: "Complete 50 community exchanges", current: donatedItems + receivedDonations, target: 50 },
        { title: "Community Hero", description: "Complete 20 donations", current: donatedItems, target: 20 },
        { title: "Planning Pro", description: "Confirm 4 weekly plans", current: confirmedPlans, target: 4 },
      ].map((milestone) => ({ ...milestone, progress: Math.min(100, Math.round((milestone.current / milestone.target) * 100)) })),
    };

    return NextResponse.json(overview ? { overview: response.overview } : response);
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics." }, { status: 500 });
  }
}
