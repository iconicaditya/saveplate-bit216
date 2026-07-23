"use client";
import { useState } from "react";
import {
  CheckCircle2, Clock, MapPin, User, ArrowRight,
  Package, HandHeart, Truck, Phone, MessageSquare, Star, ChevronRight,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Donation Listed", icon: Package, done: true, time: "9:02 AM" },
  { id: 2, label: "Recipient Matched", icon: HandHeart, done: true, time: "9:04 AM" },
  { id: 3, label: "Claim Confirmed", icon: CheckCircle2, done: true, time: "9:11 AM" },
  { id: 4, label: "Ready for Pickup", icon: Truck, done: false, time: "Est. 11:00 AM" },
];

const CANDIDATES = [
  { name: "Maria Santos", type: "Individual", distance: "0.4 mi", score: 98, needs: ["Produce", "Bakery"], avatar: "MS", status: "confirmed", rating: 4.9, pickups: 12 },
  { name: "Hope Community Kitchen", type: "Food Bank", distance: "1.1 mi", score: 91, needs: ["Any"], avatar: "HK", status: "pending", rating: 4.7, pickups: 204 },
  { name: "James Okafor", type: "Individual", distance: "1.6 mi", score: 84, needs: ["Dairy", "Pantry"], avatar: "JO", status: "declined", rating: 4.5, pickups: 7 },
];

const statusMeta: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Confirmed", color: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  declined: { label: "Declined", color: "bg-gray-100 text-gray-500" },
};

const historyRows = [
  { item: "Banana Bunch", donor: "Alex T.", recipient: "Maria S.", score: 95, time: "Yesterday 3:20 PM", status: "Completed" },
  { item: "Brown Rice", donor: "Lisa R.", recipient: "Hope Kitchen", score: 88, time: "Yesterday 1:00 PM", status: "Completed" },
  { item: "Yogurt (x3)", donor: "James K.", recipient: "James O.", score: 79, time: "Mon 11:40 AM", status: "Completed" },
  { item: "Pasta Sauce", donor: "Nina C.", recipient: "—", score: 0, time: "Mon 9:15 AM", status: "Expired" },
  { item: "Chicken Thighs", donor: "David W.", recipient: "Maria S.", score: 91, time: "Sun 6:30 PM", status: "Completed" },
];

export default function DonationMatchingPage() {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  return (
    <div className="space-y-5">

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["active", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "active" ? "Active Match" : "Match History"}
          </button>
        ))}
      </div>

      {activeTab === "active" ? (
        <div className="grid grid-cols-12 gap-5">

          {/* Left — Item + Status Timeline */}
          <div className="col-span-4 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=220&fit=crop&q=80"
                alt="Sourdough Bread"
                className="w-full h-[130px] object-cover"
                style={{ filter: "grayscale(70%) brightness(0.97)" }}
              />
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">Sourdough Bread</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Donated by Sarah M.</p>
                  </div>
                  <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-medium px-2 py-0.5 rounded shrink-0">Bakery</span>
                </div>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    1 loaf · Fridge storage
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-orange-600 font-medium">Expires tomorrow</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    124 Maple St · Available 10am–2pm
                  </div>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-4">Claim Status</h4>
              <div className="relative">
                <div className="absolute left-[13px] top-3 bottom-3 w-px bg-gray-200" />
                <div className="space-y-5">
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const isLast = i === STEPS.length - 1;
                    return (
                      <div key={step.id} className="flex items-start gap-3 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                          step.done ? "bg-[#4CAF50] border-[#4CAF50]" : isLast ? "bg-white border-dashed border-gray-300" : "bg-white border-gray-200"
                        }`}>
                          <Icon className={`w-3.5 h-3.5 ${step.done ? "text-white" : "text-gray-400"}`} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className={`text-sm font-medium leading-tight ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                          <p className={`text-xs mt-0.5 ${step.done ? "text-gray-500" : "text-gray-300"}`}>{step.time}</p>
                        </div>
                        {step.id === 3 && (
                          <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-medium px-2 py-0.5 rounded shrink-0 mt-0.5">Live</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Middle — Match Score + Recipient Candidates */}
          <div className="col-span-5 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Recipient Candidates</h4>
                <span className="text-xs text-gray-400">Sorted by match score</span>
              </div>
              <div className="space-y-3">
                {CANDIDATES.map((c, i) => {
                  const meta = statusMeta[c.status];
                  const isTop = i === 0;
                  return (
                    <div key={i} className={`p-3 rounded-lg border transition-all ${
                      isTop ? "border-[#4CAF50] bg-[#F1F8F1]" : c.status === "declined" ? "border-gray-100 bg-gray-50 opacity-60" : "border-gray-200 bg-white"
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isTop ? "bg-[#4CAF50] text-white" : "bg-gray-200 text-gray-600"}`}>
                          {c.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900 truncate">{c.name}</span>
                            <span className={`${meta.color} text-[10px] font-medium px-2 py-0.5 rounded shrink-0`}>{meta.label}</span>
                            {isTop && <span className="bg-amber-50 text-amber-600 text-[10px] font-medium px-2 py-0.5 rounded">Best Match</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{c.type}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.distance}</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{c.rating}</span>
                            <span className="flex items-center gap-1"><Package className="w-3 h-3" />{c.pickups} pickups</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {c.needs.map((n) => (
                              <span key={n} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{n}</span>
                            ))}
                          </div>
                        </div>
                        {/* Match score ring */}
                        <div className="shrink-0 text-center">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                            style={{ background: `conic-gradient(${isTop ? "#4CAF50" : "#9ca3af"} ${c.score}%, #e5e7eb ${c.score}%)` }}
                          >
                            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-gray-700">
                              {c.score}
                            </div>
                          </div>
                        </div>
                      </div>
                      {isTop && (
                        <div className="mt-3 flex gap-2">
                          <button className="flex-1 h-7 text-xs bg-[#4CAF50] text-white rounded flex items-center justify-center gap-1 hover:bg-[#3d8c40] transition-colors">
                            <Phone className="w-3 h-3" /> Contact
                          </button>
                          <button className="flex-1 h-7 text-xs border border-gray-200 text-gray-700 rounded flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors">
                            <MessageSquare className="w-3 h-3" /> Message
                          </button>
                          <button className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 rounded hover:bg-gray-50 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Match Score Factors */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Match Score Factors</h4>
              <div className="space-y-2.5">
                {[
                  { label: "Proximity", value: 92, weight: "30%" },
                  { label: "Food Preference Match", value: 100, weight: "35%" },
                  { label: "Recipient Reliability", value: 98, weight: "20%" },
                  { label: "Pickup Availability", value: 95, weight: "15%" },
                ].map((f) => (
                  <div key={f.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">{f.label}</span>
                      <span className="text-gray-400">{f.weight} weight · <span className="text-gray-700 font-medium">{f.value}</span></span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#4CAF50] rounded-full" style={{ width: `${f.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Map + Actions */}
          <div className="col-span-3 space-y-4">
            {/* Pseudo-map */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-[200px] bg-gray-100">
                <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                  {[...Array(8)].map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 28} x2="100%" y2={i * 28} stroke="#9ca3af" strokeWidth="0.5" />
                  ))}
                  {[...Array(10)].map((_, i) => (
                    <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2="100%" stroke="#9ca3af" strokeWidth="0.5" />
                  ))}
                  <line x1="0" y1="70" x2="100%" y2="70" stroke="#d1d5db" strokeWidth="3" />
                  <line x1="90" y1="0" x2="90" y2="100%" stroke="#d1d5db" strokeWidth="3" />
                  <line x1="0" y1="150" x2="60%" y2="150" stroke="#d1d5db" strokeWidth="2" />
                  <line x1="180" y1="0" x2="180" y2="150" stroke="#d1d5db" strokeWidth="2" />
                  <line x1="90" y1="70" x2="145" y2="120" stroke="#4CAF50" strokeWidth="2.5" strokeDasharray="6 3" strokeLinecap="round" />
                </svg>
                <div className="absolute" style={{ left: 77, top: 55 }}>
                  <div className="w-7 h-7 rounded-full bg-[#4CAF50] border-2 border-white shadow flex items-center justify-center">
                    <Package className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="mt-1 bg-white text-[10px] font-medium text-gray-700 px-1.5 py-0.5 rounded shadow whitespace-nowrap -translate-x-3">Donor</div>
                </div>
                <div className="absolute" style={{ left: 132, top: 105 }}>
                  <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white shadow flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="mt-1 bg-white text-[10px] font-medium text-gray-700 px-1.5 py-0.5 rounded shadow whitespace-nowrap -translate-x-6">Maria S.</div>
                </div>
                <div className="absolute bottom-2 left-2 bg-white/90 border border-gray-200 text-[10px] font-medium text-gray-600 px-2 py-1 rounded-md shadow-sm">
                  0.4 mi · ~8 min walk
                </div>
              </div>
              <div className="px-3 py-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#4CAF50]" /> Donor</div>
                <div className="flex items-center gap-1 ml-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Recipient</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</h4>
              <button className="w-full h-8 text-xs bg-[#4CAF50] hover:bg-[#3d8c40] text-white rounded flex items-center justify-between px-3 transition-colors">
                Mark Ready for Pickup <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button className="w-full h-8 text-xs border border-gray-200 text-gray-700 rounded flex items-center justify-between px-3 hover:bg-gray-50 transition-colors">
                Reassign to Next Match <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button className="w-full h-8 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 rounded flex items-center justify-between px-3 transition-colors">
                Cancel Donation <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Avg Match Time", value: "2 min" },
                { label: "Claim Rate", value: "94%" },
                { label: "Waste Prevented", value: "1.2 kg" },
                { label: "CO₂ Saved", value: "3.1 kg" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-2.5 text-center shadow-sm">
                  <p className="text-base font-bold text-gray-900">{s.value}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Item", "Donor", "Recipient", "Match Score", "Pickup Time", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyRows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.item}</td>
                    <td className="px-4 py-3 text-gray-500">{row.donor}</td>
                    <td className="px-4 py-3 text-gray-500">{row.recipient}</td>
                    <td className="px-4 py-3">
                      {row.status === "Expired" ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                            <div className="h-full bg-[#4CAF50] rounded-full" style={{ width: `${row.score}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{row.score}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{row.time}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${row.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
