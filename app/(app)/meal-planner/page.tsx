import { ChevronLeft, ChevronRight, Wand2, Plus, Clock, CheckCircle2, Calendar, Package } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const meals = ["Breakfast", "Lunch", "Dinner", "Snack"];

const plan: Record<string, { name: string; tags: string[]; status?: string }> = {
  "Mon-Dinner": { name: "Chicken Stir Fry", tags: ["Chicken Breast", "Peas"], status: "planned" },
  "Tue-Lunch": { name: "Apple Salad", tags: ["Organic Apples", "Spinach"], status: "planned" },
  "Wed-Dinner": { name: "Pasta with Veggies", tags: ["Pasta", "Carrots"], status: "planned" },
  "Thu-Breakfast": { name: "Oatmeal", tags: ["Oatmeal", "Almond Milk"], status: "confirmed" },
  "Fri-Lunch": { name: "Tomato Soup", tags: ["Tomatoes", "Milk"], status: "planned" },
  "Sat-Dinner": { name: "Bean Tacos", tags: ["Black Beans", "Cheese"], status: "confirmed" },
};

export default function MealPlannerPage() {
  return (
    <div className="space-y-6">

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button className="h-8 w-8 flex items-center justify-center text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-900 w-36 text-center">Jun 23 – Jun 29</span>
          <button className="h-8 w-8 flex items-center justify-center text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" /> Add Meal
          </button>
          <button className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
            <Wand2 className="w-4 h-4 text-gray-500" /> Get Suggestions
          </button>
          <button className="flex items-center gap-2 bg-[#4CAF50] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#3d8c40] transition-colors">
            Confirm Plan
          </button>
        </div>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-24 p-3 border-r border-gray-200 text-xs text-gray-500 font-medium text-left pl-4">Meal</th>
                {days.map((d, i) => (
                  <th key={d} className={`p-3 text-center text-sm font-semibold border-r border-gray-200 last:border-r-0 ${i === 0 ? "bg-gray-100 text-gray-900" : "text-gray-600"}`}>
                    <div>{d}</div>
                    <div className={`text-xs font-normal mt-0.5 ${i === 0 ? "text-gray-700" : "text-gray-400"}`}>Jun {23 + i}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meals.map((meal) => (
                <tr key={meal} className="border-b border-gray-100 last:border-b-0">
                  <th className="px-4 py-2 text-xs font-semibold text-gray-500 text-left border-r border-gray-200 bg-gray-50/50 w-24">
                    {meal}
                  </th>
                  {days.map((day) => {
                    const key = `${day}-${meal}`;
                    const cell = plan[key];
                    return (
                      <td key={day} className="p-2 border-r border-gray-100 last:border-r-0 h-24 align-top group">
                        {cell ? (
                          <div className={`h-full rounded-lg p-2 flex flex-col border transition-colors ${cell.status === "confirmed" ? "bg-gray-100 border-gray-300" : "bg-white border-gray-200 hover:border-gray-300"}`}>
                            <span className="text-xs font-semibold text-gray-900 leading-tight mb-auto">{cell.name}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {cell.tags.map((t) => (
                                <span key={t} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 truncate max-w-full">{t}</span>
                              ))}
                            </div>
                            {cell.status === "confirmed" && (
                              <div className="mt-1">
                                <span className="text-[9px] bg-gray-700 text-white h-4 px-1 rounded inline-flex items-center">Confirmed</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full border-2 border-dashed border-transparent group-hover:border-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                            <span className="text-[11px] text-transparent group-hover:text-gray-400 flex items-center font-medium">
                              <Plus className="w-3 h-3 mr-0.5" /> Add
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meal Suggestion Modal */}
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Meal Suggestions (based on expiring items)</div>
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-lg">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Suggested Meals</h2>
              <p className="text-xs text-gray-500 mt-0.5">Based on items expiring soon in your inventory</p>
            </div>
            <Wand2 className="w-5 h-5 text-[#4CAF50]" />
          </div>
          <div className="p-4 space-y-3">
            {[
              { name: "Creamy Tomato Soup", ing: "Milk, Tomatoes, Garlic", time: "25 min", exp: true },
              { name: "Chicken & Veggie Bake", ing: "Chicken Breast, Carrots, Potatoes", time: "45 min", exp: true },
              { name: "Fruit Smoothie", ing: "Organic Apples, Spinach, Almond Milk", time: "5 min", exp: false },
            ].map((s, i) => (
              <div key={i} className="p-3 bg-white border border-gray-200 rounded-lg flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-sm text-gray-900">{s.name}</h4>
                    {s.exp && (
                      <span className="inline-flex items-center text-[10px] font-medium bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3 mr-1" /> Near Expiry
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Uses: {s.ing}</p>
                  <p className="text-[11px] text-gray-400">Cooking time: {s.time}</p>
                </div>
                <button className="text-xs h-7 px-3 border border-[#4CAF50]/30 text-[#4CAF50] rounded hover:bg-[#4CAF50]/5 transition-colors shrink-0">
                  Add to Plan
                </button>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button className="text-gray-500 text-xs px-4 py-1.5 rounded hover:bg-gray-100 transition-colors">Close</button>
          </div>
        </div>
      </div>

      {/* Confirm Weekly Plan */}
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Confirm Weekly Plan</div>
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Confirm Weekly Meal Plan</h2>
              <p className="text-xs text-gray-500 mt-0.5">Week of Jun 23 – Jun 29, 2026</p>
            </div>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Weekly Summary</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Total meals planned", val: "6 / 28 slots" },
                  { label: "Breakfast", val: "1 meal" },
                  { label: "Lunch", val: "2 meals" },
                  { label: "Dinner", val: "3 meals" },
                  { label: "Snack", val: "0 meals" },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-gray-500">{r.label}</span>
                    <span className="font-medium text-gray-800">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Reserved Inventory</h3>
              <div className="space-y-2">
                {[
                  { item: "Chicken Breast", qty: "2 lbs" },
                  { item: "Organic Apples", qty: "2 items" },
                  { item: "Pasta", qty: "200g" },
                  { item: "Canned Black Beans", qty: "2 cans" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-800 flex-1">{r.item}</span>
                    <span className="text-gray-500">{r.qty}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Reminders</h3>
              <div className="space-y-2 text-xs text-gray-600">
                {[
                  "Reminder for Mon dinner at 5:00 PM",
                  "Reminder for Tue lunch at 11:30 AM",
                  "Reminder for Wed dinner at 5:00 PM",
                  "Reminder for Thu breakfast at 7:00 AM",
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                    <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
              <div className="pt-2 space-y-2">
                <button className="w-full bg-[#4CAF50] text-white text-sm font-medium h-9 rounded-md hover:bg-[#3d8c40] transition-colors">
                  Confirm Weekly Plan
                </button>
                <button className="w-full border border-gray-200 text-gray-700 text-sm h-9 rounded-md hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">Plan confirmed!</p>
                    <p className="text-xs text-green-600 mt-0.5">Reminders have been set.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
