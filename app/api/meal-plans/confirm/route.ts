import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateToken } from "@/lib/auth-middleware";

export async function POST(req: NextRequest) {
  const user = authenticateToken(req); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { weekStart } = await req.json();
  if (!weekStart) return NextResponse.json({ error: "Week start is required." }, { status: 400 });
  try {
    const plan = await prisma.mealPlan.findUnique({ where: { userId_weekStart: { userId: user.id, weekStart: new Date(`${weekStart}T00:00:00`) } }, include: { meals: { include: { ingredients: true } } } });
    if (!plan) return NextResponse.json({ error: "Meal plan not found." }, { status: 404 });
    if (plan.status === "CONFIRMED") return NextResponse.json({ plan, message: "This weekly plan is already confirmed." });
    const needed = new Map<string, number>(); plan.meals.flatMap((meal) => meal.ingredients).forEach((ingredient) => needed.set(ingredient.foodItemId, (needed.get(ingredient.foodItemId) || 0) + Number(ingredient.quantity)));
    await prisma.$transaction(async (tx) => {
      for (const [foodItemId, amount] of needed) {
        const item = await tx.foodItem.findFirst({
          where: { id: foodItemId, userId: user.id, status: { notIn: ["Expired", "Donated"] }, NOT: { donation: { is: { status: { in: ["AVAILABLE", "CLAIMED"] } } } } },
        });
        if (!item) throw new Error("An ingredient is no longer available in your inventory.");
        const available = Number(item.quantity) - Number(item.reservedQuantity);
        if (!Number.isFinite(Number(item.quantity)) || available < amount) throw new Error(`${item.name} does not have enough available quantity to reserve.`);
        await tx.foodItem.update({ where: { id: foodItemId }, data: { reservedQuantity: { increment: amount } } });
      }
      await tx.mealPlan.update({ where: { id: plan.id }, data: { status: "CONFIRMED", confirmedAt: new Date() } });
      await tx.notification.create({ data: { type: "meal_plan", title: "Weekly meal plan confirmed", message: "Your meal ingredients are reserved and your weekly plan is ready.", userId: user.id } });
    });
    return NextResponse.json({ message: "Weekly plan confirmed and inventory reserved." });
  } catch (error: any) { return NextResponse.json({ error: error.message || "Failed to confirm weekly plan." }, { status: 409 }); }
}

export async function DELETE(req: NextRequest) {
  const user = authenticateToken(req); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const { weekStart } = await req.json();
    const plan = await prisma.mealPlan.findUnique({ where: { userId_weekStart: { userId: user.id, weekStart: new Date(`${weekStart}T00:00:00`) } }, include: { meals: { include: { ingredients: true } } } });
    if (!plan || plan.status !== "CONFIRMED") return NextResponse.json({ error: "A confirmed plan for this week was not found." }, { status: 404 });
    await prisma.$transaction(async (tx) => {
      for (const ingredient of plan.meals.flatMap((meal) => meal.ingredients)) await tx.foodItem.update({ where: { id: ingredient.foodItemId }, data: { reservedQuantity: { decrement: ingredient.quantity } } });
      await tx.mealPlan.update({ where: { id: plan.id }, data: { status: "CANCELLED" } });
    });
    return NextResponse.json({ message: "Plan cancelled and inventory reservations released." });
  } catch (error) { console.error("DELETE /api/meal-plans/confirm", error); return NextResponse.json({ error: "Failed to cancel plan." }, { status: 500 }); }
}
