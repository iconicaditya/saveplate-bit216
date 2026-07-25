"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BarChart2, Calendar, Clock, HeartHandshake, Leaf, Package, Plus, Search } from "lucide-react";
import { getAnalytics } from "@/lib/api";

type Overview = { totalInventory: number; nearExpiryItems: number; activeListings: number; completedDonations: number; completedMeals: number };

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const loadOverview = useCallback(async () => {
    try { setError(""); const data = await getAnalytics({ range: "30d", overview: true }); setOverview(data.overview); }
    catch (err: any) { setError(err.message || "Unable to load your dashboard summary."); }
  }, []);
  useEffect(() => { loadOverview(); }, [loadOverview]);
  const cards = overview ? [
    { label: "Total Food", value: overview.totalInventory, subtext: "available inventory items", icon: Package },
    { label: "Near Expiry", value: overview.nearExpiryItems, subtext: "items needing attention", icon: Clock },
    { label: "Active Listings", value: overview.activeListings, subtext: "donations currently shared", icon: HeartHandshake },
    { label: "Meals Planned", value: overview.completedMeals, subtext: "in confirmed plans this month", icon: Calendar },
    { label: "Donations Completed", value: overview.completedDonations, subtext: "this month", icon: Leaf },
  ] : [];
  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-xl font-semibold text-gray-900">Dashboard</h1><p className="mt-1 text-sm text-gray-500">A live overview of your SavePlate activity.</p></div><Link href="/analytics" className="inline-flex items-center gap-2 text-sm font-medium text-[#2E7D32] hover:underline"><BarChart2 className="h-4 w-4" /> View impact analytics</Link></div>
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error} <button onClick={loadOverview} className="font-medium underline">Try again</button></div>}
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">{overview ? cards.map(({ label, value, subtext, icon: Icon }) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-2"><div><p className="text-xs font-medium text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-400">{subtext}</p></div><div className="rounded-md bg-[#E8F5E9] p-2"><Icon className="h-4 w-4 text-[#2E7D32]" /></div></div></div>) : Array.from({ length: 5 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />)}</div>
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-gray-900">Quick actions</h2><div className="mt-4 flex flex-wrap gap-3"><Link href="/inventory" className="inline-flex items-center gap-2 rounded-lg bg-[#4CAF50] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d8c40]"><Plus className="h-4 w-4" /> Add Food</Link><Link href="/browse" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Search className="h-4 w-4" /> Browse Food</Link><Link href="/donations" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><HeartHandshake className="h-4 w-4" /> My Donations</Link><Link href="/meal-planner" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Calendar className="h-4 w-4" /> Meal Planner</Link></div></section>
  </div>;
}
