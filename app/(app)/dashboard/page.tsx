import Link from "next/link";
import {
  Plus, HeartHandshake, Search, Calendar, BarChart2,
  Package, Clock, Box, Leaf, Bell,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* Stat Cards — 5 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500">Total Food</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">42</h3>
              <p className="text-xs text-gray-400 mt-1">items in pantry</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-md"><Package className="w-4 h-4 text-gray-600" /></div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-700">Near Expiry</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">7</h3>
              <p className="text-xs text-gray-500 mt-1">within 3 days</p>
            </div>
            <div className="p-2 bg-gray-200 rounded-md"><Clock className="w-4 h-4 text-gray-700" /></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500">Donations</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">3</h3>
              <p className="text-xs text-gray-400 mt-1">active listings</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-md"><HeartHandshake className="w-4 h-4 text-gray-600" /></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500">Meals</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">12</h3>
              <p className="text-xs text-gray-400 mt-1">this week</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-md"><Calendar className="w-4 h-4 text-gray-600" /></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 border-l-2 border-l-[#4CAF50] rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500">Food Saved</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">28<span className="text-sm font-normal text-gray-500 ml-1">kg</span></h3>
              <p className="text-xs text-[#4CAF50] mt-1 font-medium">+3.2kg this week</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-md"><Leaf className="w-4 h-4 text-gray-600" /></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/inventory" className="inline-flex items-center gap-2 bg-[#4CAF50] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#3d8c40] transition-colors">
          <Plus className="w-4 h-4" /> Add Food
        </Link>
        <Link href="/browse" className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <HeartHandshake className="w-4 h-4" /> Donate Food
        </Link>
        <Link href="/browse" className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Search className="w-4 h-4" /> Browse
        </Link>
        <Link href="/meal-planner" className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Calendar className="w-4 h-4" /> Meal Planner
        </Link>
        <Link href="/analytics" className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <BarChart2 className="w-4 h-4" /> Analytics
        </Link>
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-5 pt-5 pb-2">
                <h3 className="text-sm font-semibold text-gray-700">Items Saved (30 Days)</h3>
              </div>
              <div className="h-48 px-6 pb-6">
                <div className="h-full flex items-end justify-between gap-1.5 border-b border-l border-gray-200 pb-2 pl-2">
                  {[35, 55, 25, 72, 48, 85, 62, 40, 90, 68].map((h, i) => (
                    <div key={i} className="flex-1 bg-gray-300 rounded-t-sm hover:bg-[#4CAF50] transition-colors" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-2">
                  <span>Jun 1</span><span>Jun 10</span><span>Jun 20</span><span>Jun 30</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-5 pt-5 pb-2">
                <h3 className="text-sm font-semibold text-gray-700">Category Breakdown</h3>
              </div>
              <div className="h-48 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-[18px] border-gray-200 border-t-gray-500 border-r-gray-400 relative">
                  <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white flex items-center justify-center">
                    <span className="text-[10px] text-gray-500 font-medium">42 items</span>
                  </div>
                </div>
                <div className="ml-5 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-500 rounded-sm" />Produce 38%</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-300 rounded-sm" />Dairy 24%</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-200 rounded-sm" />Pantry 38%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Expiry */}
          <div className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Upcoming Expiry</h3>
              <span className="bg-gray-200 text-gray-700 border border-gray-300 text-xs px-2 py-0.5 rounded-full">7 items</span>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                { name: "Whole Milk", days: "Tomorrow", storage: "Fridge" },
                { name: "Chicken Breast", days: "Today", storage: "Fridge" },
                { name: "Spinach", days: "In 2 days", storage: "Fridge" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    <span className="text-sm text-gray-800 font-medium">{item.name}</span>
                    <span className="text-xs text-gray-400">{item.storage}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 font-medium">{item.days}</span>
                    <button className="border border-gray-300 text-gray-700 text-xs h-6 px-2 rounded hover:bg-gray-100 transition-colors">Use Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-4 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { icon: Plus, text: "Added 3 Apples", time: "2h ago" },
                { icon: Clock, text: "Milk expiring tomorrow", time: "4h ago" },
                { icon: HeartHandshake, text: "Donated Canned Soup", time: "1d ago" },
                { icon: Calendar, text: "Generated Weekly Plan", time: "1d ago" },
                { icon: Box, text: "Marked Pasta as Used", time: "2d ago" },
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div className="p-1.5 bg-gray-100 rounded text-gray-600 mt-0.5 shrink-0">
                    <act.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">{act.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications Preview */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <span className="bg-gray-800 text-white text-[10px] h-5 px-1.5 rounded flex items-center">3 new</span>
            </div>
            <div>
              {[
                { icon: Clock, text: "Milk expiring tomorrow" },
                { icon: HeartHandshake, text: "Your donation was claimed" },
                { icon: Bell, text: "Weekly plan reminder" },
              ].map((n, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-2 h-2 bg-gray-700 rounded-full shrink-0" />
                  <div className="flex items-center gap-2 min-w-0">
                    <n.icon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <p className="text-xs text-gray-700 font-medium truncate">{n.text}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-3">
                <Link href="/notifications" className="block w-full text-center text-xs text-gray-500 hover:text-gray-700 py-1">View all notifications</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
