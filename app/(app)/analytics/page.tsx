import { TrendingUp, TrendingDown, Target, Calendar, Filter } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">

      {/* Filter Row */}
      <div className="flex gap-4">
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 w-48 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors">
          <Calendar className="w-4 h-4 text-gray-500" />
          Last 30 Days
        </button>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 w-40 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4 text-gray-500" />
          All Categories
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Food Saved</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-3xl font-bold text-gray-900">28<span className="text-xl">kg</span></h3>
            <span className="flex items-center text-xs font-medium text-[#4CAF50] mb-1">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Donations Made</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-3xl font-bold text-gray-900">12</h3>
            <span className="flex items-center text-xs font-medium text-[#4CAF50] mb-1">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +2
            </span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Meals Planned</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-3xl font-bold text-gray-900">34</h3>
            <span className="flex items-center text-xs font-medium text-gray-400 mb-1">
              <TrendingDown className="w-3 h-3 mr-0.5" /> -4%
            </span>
          </div>
        </div>
        <div className="bg-[#E8F5E9] border border-[#4CAF50]/30 rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-[#2E7D32]">Waste Prevented</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-3xl font-bold text-[#1B5E20]">67%</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-80">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900">Monthly Donations</h3>
          </div>
          <div className="p-6 h-[calc(100%-3.5rem)] relative">
            <div className="absolute inset-x-6 top-6 bottom-6 flex items-end justify-between gap-4 border-b border-l border-gray-200 pt-4 pl-2">
              {[30, 45, 25, 60, 50, 75, 55, 90, 80, 100, 65, 85].map((h, i) => (
                <div
                  key={i}
                  className="w-full bg-gray-300 rounded-t-sm hover:bg-[#4CAF50] transition-colors"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-80">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900">Category Breakdown</h3>
          </div>
          <div className="p-6 flex items-center justify-center h-[calc(100%-3.5rem)]">
            <div className="w-48 h-48 rounded-full border-[24px] border-gray-200 border-t-gray-400 border-r-gray-300 border-l-[#4CAF50] relative">
              <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-white flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600">Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">Sustainability Milestones</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Waste Warrior", desc: "Save 50kg of food", progress: 60 },
            { title: "Community Hero", desc: "Donate 20 items", progress: 85 },
            { title: "Planning Pro", desc: "Plan meals for 4 weeks", progress: 40 },
          ].map((m, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center mb-3">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">{m.title}</h4>
              <p className="text-xs text-gray-500 mb-3">{m.desc}</p>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#4CAF50] h-2 rounded-full" style={{ width: `${m.progress}%` }} />
              </div>
              <span className="text-xs text-gray-500 mt-1">{m.progress}% Complete</span>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl h-32 flex items-center justify-center opacity-70">
        <div className="text-center">
          <p className="text-gray-500 font-medium">Historical data will appear here</p>
          <p className="text-xs text-gray-400">Keep using SavePlate to generate more insights.</p>
        </div>
      </div>
    </div>
  );
}
