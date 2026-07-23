import Link from "next/link";
import { Search, MapPin, Clock } from "lucide-react";

const items = [
  { name: "Sourdough Bread", cat: "Bakery", qty: "1 loaf", exp: "Expires tomorrow", dist: "0.5 mi", donor: "Sarah M.", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=200&fit=crop&q=80" },
  { name: "Canned Tomato Soup", cat: "Pantry", qty: "4 cans", exp: "Expires in 3 mos", dist: "1.2 mi", donor: "Community Member", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=200&fit=crop&q=80" },
  { name: "Fresh Spinach", cat: "Produce", qty: "1 bag", exp: "Expires in 2 days", dist: "0.8 mi", donor: "James T.", img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=200&fit=crop&q=80" },
  { name: "Almond Milk", cat: "Dairy", qty: "Half carton", exp: "Expires in 3 days", dist: "2.1 mi", donor: "Priya K.", img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=200&fit=crop&q=80" },
  { name: "Spaghetti Pasta", cat: "Pantry", qty: "2 boxes", exp: "Expires in 1 yr", dist: "1.5 mi", donor: "Marco L.", img: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=200&fit=crop&q=80" },
  { name: "Organic Apples", cat: "Produce", qty: "5 items", exp: "Expires in 4 days", dist: "0.3 mi", donor: "Lisa R.", img: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=200&fit=crop&q=80" },
  { name: "Oatmeal", cat: "Pantry", qty: "1 box", exp: "Expires in 2 mos", dist: "3.0 mi", donor: "David W.", img: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&h=200&fit=crop&q=80" },
  { name: "Baby Carrots", cat: "Produce", qty: "1 bag", exp: "Expires in 1 week", dist: "0.9 mi", donor: "Nina C.", img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=200&fit=crop&q=80" },
];

export default function BrowseFoodPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Filter Sidebar */}
        <div className="w-full md:w-[200px] shrink-0 space-y-7">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Category</h3>
            <div className="space-y-2">
              {["Produce", "Dairy", "Bakery", "Pantry", "Meat", "Frozen"].map((c, i) => (
                <label key={c} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 ${i === 1 ? "border-[#4CAF50] bg-[#4CAF50]" : "border-gray-300 bg-white"}`}>
                    {i === 1 && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Distance</h3>
            <input type="range" className="w-full accent-[#4CAF50]" defaultValue={50} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 mi</span><span>10 mi</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Expiry</h3>
            <div className="space-y-2">
              {["Today", "This Week", "This Month", "Any"].map((c, i) => (
                <label key={c} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center shrink-0 ${i === 1 ? "border-[#4CAF50]" : "border-gray-300 bg-white"}`}>
                    {i === 1 && <div className="w-2 h-2 bg-[#4CAF50] rounded-full" />}
                  </div>
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Storage Type</h3>
            <div className="space-y-2">
              {["Fridge", "Freezer", "Pantry"].map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <div className="w-4 h-4 border-2 border-gray-300 bg-white rounded shrink-0" />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Availability</h3>
            <div className="space-y-2">
              {["Available Now", "Today", "This Week"].map((c, i) => (
                <label key={c} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 ${i === 0 ? "border-[#4CAF50] bg-[#4CAF50]" : "border-gray-300 bg-white"}`}>
                    {i === 0 && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  {c}
                </label>
              ))}
            </div>
          </div>

          <button className="w-full text-xs text-gray-500 border border-gray-200 h-8 rounded-md hover:bg-gray-50 transition-colors">Clear Filters</button>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input placeholder="Search donations..." className="pl-10 w-full bg-white border border-gray-200 h-9 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">42</span> items available
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {items.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-gray-300 hover:shadow-md transition-all">
                <div className="h-[150px] overflow-hidden relative">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    style={{ filter: "grayscale(85%) brightness(0.95)" }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-white/90 text-gray-700 border border-gray-200 text-[10px] font-medium px-2 py-0.5 rounded shadow-sm">
                      {item.cat}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</h4>
                  <p className="text-xs text-gray-500">Qty: <span className="text-gray-700 font-medium">{item.qty}</span></p>
                  <div className="flex items-center text-xs text-gray-500 gap-1">
                    <Clock className="w-3 h-3 shrink-0" /> {item.exp}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 gap-1">
                    <MapPin className="w-3 h-3 shrink-0" /> {item.dist} away
                  </div>
                  <p className="text-[11px] text-gray-400 mt-auto">Donor: {item.donor}</p>
                  <Link
                    href="/browse/matching"
                    className="w-full mt-1 border border-gray-200 text-gray-700 hover:bg-gray-50 h-8 text-xs font-medium rounded-md flex items-center justify-center transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* No Results / Empty State */}
          <div className="py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center text-center bg-gray-50">
            <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
              <Search className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">No results found</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-4">Try adjusting your filters or expanding your search distance.</p>
            <button className="bg-[#4CAF50] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#3d8c40] transition-colors">Clear Filters</button>
          </div>
        </div>
      </div>
    </div>
  );
}
