"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, List, Search, Calendar, BarChart2, Bell, Settings, LogOut, Menu, X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inventory", icon: List, label: "Food Inventory" },
  { href: "/browse", icon: Search, label: "Browse Food" },
  { href: "/meal-planner", icon: Calendar, label: "Meal Planner" },
  { href: "/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/notifications", icon: Bell, label: "Notifications", badge: 3 },
  { href: "/settings", icon: Settings, label: "Account Settings" },
];

const pageMeta: Record<string, { title: string; breadcrumb: string }> = {
  "/dashboard": { title: "Dashboard", breadcrumb: "Home / Dashboard" },
  "/inventory": { title: "Food Inventory", breadcrumb: "Home / Food Inventory" },
  "/browse": { title: "Browse Donations", breadcrumb: "Home / Browse Food" },
  "/browse/matching": { title: "Donation Matching", breadcrumb: "Home / Donations / Matching" },
  "/meal-planner": { title: "Meal Planner", breadcrumb: "Home / Meal Planner" },
  "/analytics": { title: "Analytics", breadcrumb: "Home / Analytics" },
  "/notifications": { title: "Notifications", breadcrumb: "Home / Notifications" },
  "/settings": { title: "Account Settings", breadcrumb: "Home / Account Settings" },
};

function isActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = pageMeta[pathname] ?? { title: "SavePlate", breadcrumb: "Home" };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden text-gray-900 font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-[240px] bg-white border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Image src="/saveplate-logo.png" alt="SavePlate" width={32} height={32} className="object-contain" />
            <span className="font-semibold text-lg tracking-tight">SavePlate</span>
          </div>
          {/* Close button on mobile */}
          <button
            className="md:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors no-underline ${
                  active
                    ? "bg-[#E8F5E9] text-[#2E7D32] border-l-2 border-[#4CAF50] -ml-px pl-[11px]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${active ? "text-[#4CAF50]" : "text-gray-500"}`} />
                  {item.label}
                </div>
                {item.badge && (
                  <span className="bg-gray-200 text-gray-700 text-xs px-1.5 min-w-[20px] h-5 rounded flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 no-underline"
          >
            <LogOut className="w-4 h-4 text-gray-500" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shrink-0 gap-4">
          {/* Mobile menu button + title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 truncate">{meta.title}</h1>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{meta.breadcrumb}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div className="relative w-40 sm:w-64 hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Search inventory, users..."
                className="pl-9 w-full bg-gray-50 border border-gray-200 h-9 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                aria-label="Search"
              />
            </div>
            <Link href="/notifications" className="relative text-gray-500 hover:text-gray-700" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#4CAF50] rounded-full border border-white" />
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block whitespace-nowrap">
                <p className="text-sm font-medium text-gray-700 leading-none">Aaditya C.</p>
                <p className="text-xs text-gray-500 mt-1">Household</p>
              </div>
              <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden shrink-0">
                <Image src="/aaditya-profile.jpg" alt="Aaditya Chaudhary" width={32} height={32} className="object-cover object-top" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}