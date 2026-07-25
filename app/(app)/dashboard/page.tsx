"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Calendar, Clock, HeartHandshake, Leaf, Package, Plus, Search, UtensilsCrossed } from "lucide-react";
import { getAnalytics } from "@/lib/api";

type Overview = {
  totalInventory: number; nearExpiryItems: number; activeListings: number; completedDonations: number; completedMeals: number;
  upcomingExpiry: { id: string; name: string; storage: string; expiryDate: string; status: string }[];
  recentNotifications: { id: string; type: string; title: string; message: string; read: boolean; createdAt: string }[];
  recentDonations: { id: string; status: string; updatedAt: string; role: "donor" | "receiver"; foodItem: { name: string } }[];
  draftMeals: { id: string; name: string; date: string; mealType: string }[];
};

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function expiryLabel(value: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expiry = new Date(value); expiry.setHours(0, 0, 0, 0);
  const days = Math.round((expiry.getTime() - today.getTime()) / 86400000);
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  return `Expires in ${days} days`;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const loadOverview = useCallback(async () => {
    try { setError(""); const data = await getAnalytics({ range: "30d", overview: true }); setOverview(data.overview); }
    catch (err: any) { setError(err.message || "Unable to load your dashboard summary."); }
  }, []);
  useEffect(() => { loadOverview(); }, [loadOverview]);
  const activity = useMemo(() => overview ? [
    ...overview.recentDonations.map((item) => ({ id: `donation-${item.id}`, text: `${item.foodItem.name}: ${item.role === "donor" ? "donation" : "request"} ${item.status.toLowerCase()}`, time: item.updatedAt, icon: HeartHandshake })),
    ...overview.draftMeals.map((item) => ({ id: `meal-${item.id}`, text: `${item.mealType}: ${item.name} is planned`, time: item.date, icon: UtensilsCrossed })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5) : [], [overview]);
  const cards = overview ? [
    { label: "Total Food", value: overview.totalInventory, subtext: "available inventory items", icon: Package },
    { label: "Near Expiry", value: overview.nearExpiryItems, subtext: "items needing attention", icon: Clock },
    { label: "Active Listings", value: overview.activeListings, subtext: "donations currently shared", icon: HeartHandshake },
    { label: "Meals Planned", value: overview.completedMeals, subtext: "in confirmed plans this month", icon: Calendar },
    { label: "Donations Completed", value: overview.completedDonations, subtext: "this month", icon: Leaf },
  ] : [];
  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-xl font-semibold text-gray-900">Dashboard</h1><p className="mt-1 text-sm text-gray-500">A live overview of your SavePlate activity.</p></div><Link href="/analytics" className="text-sm font-medium text-[#2E7D32] hover:underline">View impact analytics</Link></div>
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error} <button onClick={loadOverview} className="font-medium underline">Try again</button></div>}
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">{overview ? cards.map(({ label, value, subtext, icon: Icon }) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-2"><div><p className="text-xs font-medium text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-400">{subtext}</p></div><div className="rounded-md bg-[#E8F5E9] p-2"><Icon className="h-4 w-4 text-[#2E7D32]" /></div></div></div>) : Array.from({ length: 5 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />)}</div>
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-gray-900">Quick actions</h2><div className="mt-4 flex flex-wrap gap-3"><Link href="/inventory" className="inline-flex items-center gap-2 rounded-lg bg-[#4CAF50] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d8c40]"><Plus className="h-4 w-4" /> Add Food</Link><Link href="/browse" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Search className="h-4 w-4" /> Browse Food</Link><Link href="/donations" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><HeartHandshake className="h-4 w-4" /> My Donations</Link><Link href="/meal-planner" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Calendar className="h-4 w-4" /> Meal Planner</Link></div></section>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3"><section className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2"><header className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><h2 className="font-semibold text-gray-900">Upcoming expiry</h2><p className="mt-0.5 text-xs text-gray-500">Use, freeze, or donate these items before expiry.</p></div><Link href="/inventory?expiry=This+Week" className="text-xs font-medium text-[#2E7D32] hover:underline">Open inventory</Link></header>{overview?.upcomingExpiry.length ? <div className="divide-y divide-gray-100">{overview.upcomingExpiry.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-gray-800">{item.name}</p><p className="text-xs text-gray-400">{item.storage} · {item.status}</p></div><span className="shrink-0 text-xs font-medium text-amber-700">{expiryLabel(item.expiryDate)}</span></div>)}</div> : <p className="p-8 text-center text-sm text-gray-500">No upcoming food expiries. Your inventory is on track.</p>}</section><section className="rounded-xl border border-gray-200 bg-white shadow-sm"><header className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><h2 className="font-semibold text-gray-900">Recent activity</h2><Link href="/donations" className="text-xs font-medium text-[#2E7D32] hover:underline">View all</Link></header>{activity.length ? <div className="divide-y divide-gray-100">{activity.map((item) => { const Icon = item.icon; return <div key={item.id} className="flex gap-3 px-5 py-3"><div className="rounded-md bg-gray-100 p-1.5"><Icon className="h-3.5 w-3.5 text-gray-600" /></div><div className="min-w-0"><p className="text-sm text-gray-800">{item.text}</p><p className="mt-0.5 text-xs text-gray-400">{relativeTime(item.time)}</p></div></div>; })}</div> : <p className="p-8 text-center text-sm text-gray-500">Activity will appear as you plan and donate food.</p>}</section></div>
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm"><header className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><h2 className="font-semibold text-gray-900">Notifications</h2><p className="mt-0.5 text-xs text-gray-500">Your most recent updates.</p></div><Link href="/notifications" className="text-xs font-medium text-[#2E7D32] hover:underline">View all</Link></header>{overview?.recentNotifications.length ? <div className="divide-y divide-gray-100">{overview.recentNotifications.slice(0, 3).map((notification) => <div key={notification.id} className="flex items-start gap-3 px-5 py-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read ? "bg-gray-300" : "bg-[#4CAF50]"}`} /><Bell className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" /><div className="min-w-0"><p className="text-sm font-medium text-gray-800">{notification.title}</p><p className="truncate text-xs text-gray-500">{notification.message}</p></div><span className="ml-auto shrink-0 text-xs text-gray-400">{relativeTime(notification.createdAt)}</span></div>)}</div> : <p className="p-8 text-center text-sm text-gray-500">You have no notifications yet.</p>}</section>
  </div>;
}
