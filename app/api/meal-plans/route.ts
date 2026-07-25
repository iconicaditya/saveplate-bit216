import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateToken } from "@/lib/auth-middleware";

const types = ["Breakfast", "Lunch", "Dinner", "Snack"];
function weekStart(value?: string) { const date = value ? new Date(`${value}T00:00:00`) : new Date(); const day = date.getDay() || 7; date.setDate(date.getDate() - day + 1); date.setHours(0, 0, 0, 0); return date; }

export async function GET(req: NextRequest) {
  const user = authenticateToken(req); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const start = weekStart(new URL(req.url).searchParams.get("weekStart") || undefined);
    const plan = await prisma.mealPlan.upsert({ where: { userId_weekStart: { userId: user.id, weekStart: start } }, create: { userId: user.id, weekStart: start }, update: {}, include: { meals: { include: { ingredients: { include: { foodItem: true } } }, orderBy: { date: "asc" } } } });
    const inventory = await prisma.foodItem.findMany({ where: { userId: user.id, status: { notIn: ["Expired", "Donated"] }, NOT: { donation: { is: { status: { in: ["AVAILABLE", "CLAIMED"] } } } } }, orderBy: { expiryDate: "asc" } });
    const suggestions = inventory.slice(0, 5).map((item) => ({ name: `${item.name} meal`, cookingTime: 25, ingredients: [{ foodItemId: item.id, name: item.name, quantity: "1", unit: item.unit }], nearExpiry: item.status === "Expiring Soon" }));
    return NextResponse.json({ plan, inventory, suggestions });
  } catch (error) { console.error("GET /api/meal-plans", error); return NextResponse.json({ error: "Failed to load meal plan." }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const user = authenticateToken(req); if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    const { weekStart: requestedWeek, date, mealType, name, cookingTime, notes, ingredients = [] } = await req.json();
    if (!date || !types.includes(mealType) || !name?.trim()) return NextResponse.json({ error: "Date, meal type, and meal name are required." }, { status: 400 });
    const start = weekStart(requestedWeek); const plan = await prisma.mealPlan.upsert({ where: { userId_weekStart: { userId: user.id, weekStart: start } }, create: { userId: user.id, weekStart: start }, update: {} });
    if (plan.status !== "DRAFT") return NextResponse.json({ error: "Create a new week to change a confirmed plan." }, { status: 409 });
    const ingredientData = ingredients.filter((i: any) => i.foodItemId && Number(i.quantity) > 0).map((i: any) => ({ foodItemId: i.foodItemId, quantity: Number(i.quantity), unit: i.unit || "items" }));
    const meal = await prisma.plannedMeal.upsert({ where: { mealPlanId_date_mealType: { mealPlanId: plan.id, date: new Date(`${date}T00:00:00`), mealType } }, create: { mealPlanId: plan.id, date: new Date(`${date}T00:00:00`), mealType, name: name.trim(), cookingTime: cookingTime ? Number(cookingTime) : null, notes: notes || null, ingredients: { create: ingredientData } }, update: { name: name.trim(), cookingTime: cookingTime ? Number(cookingTime) : null, notes: notes || null, ingredients: { deleteMany: {}, create: ingredientData } }, include: { ingredients: { include: { foodItem: true } } } });
    return NextResponse.json({ meal }, { status: 201 });
  } catch (error) { console.error("POST /api/meal-plans", error); return NextResponse.json({ error: "Failed to save meal." }, { status: 500 }); }
}
