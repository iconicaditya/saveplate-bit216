import { Search, Plus, Eye, Edit2, CheckSquare, HeartHandshake, Trash2, AlertCircle } from "lucide-react";

const items = [
  { name: "Organic Apples", category: "Produce", qty: "3 items", expiry: "Jun 30, 2026", storage: "Fridge", status: "Fresh", warn: false },
  { name: "Whole Milk", category: "Dairy", qty: "1 Gallon", expiry: "Jun 27, 2026", storage: "Fridge", status: "Expiring Soon", warn: true },
  { name: "Whole Wheat Bread", category: "Bakery", qty: "1 Loaf", expiry: "Jun 29, 2026", storage: "Pantry", status: "Fresh", warn: false },
  { name: "Chicken Breast", category: "Meat", qty: "2 lbs", expiry: "Jun 26, 2026", storage: "Fridge", status: "Expiring Soon", warn: true },
  { name: "Canned Black Beans", category: "Pantry", qty: "4 cans", expiry: "Dec 15, 2026", storage: "Pantry", status: "Fresh", warn: false },
  { name: "Cheddar Cheese", category: "Dairy", qty: "1 block", expiry: "Jul 10, 2026", storage: "Fridge", status: "Fresh", warn: false },
  { name: "Frozen Peas", category: "Frozen", qty: "1 bag", expiry: "Sep 1, 2026", storage: "Freezer", status: "Fresh", warn: false },
  { name: "Almond Butter", category: "Pantry", qty: "1 jar", expiry: "Jul 25, 2026", storage: "Pantry", status: "Fresh", warn: false },
];

export default function InventoryPage() {
  return (
    <div className="space-y-6">

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex gap-2 flex-1 flex-wrap">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input placeholder="Search food items..." className="pl-9 bg-white border border-gray-200 h-9 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-gray-300" />
          </div>
          <select className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:outline-none">
            <option>Category: All</option>
            <option>Produce</option>
            <option>Dairy</option>
            <option>Pantry</option>
            <option>Frozen</option>
          </select>
          <select className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:outline-none">
            <option>Storage: All</option>
            <option>Fridge</option>
            <option>Pantry</option>
            <option>Freezer</option>
          </select>
          <select className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:outline-none">
            <option>Expiry: All</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
          <select className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:outline-none">
            <option>Status: All</option>
            <option>Fresh</option>
            <option>Expiring Soon</option>
            <option>Expired</option>
          </select>
        </div>
        <button className="flex items-center gap-2 bg-[#4CAF50] text-white text-sm font-medium px-4 h-9 rounded-md hover:bg-[#3d8c40] transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left w-8">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Item Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Expiry Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Storage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className={`border-b border-gray-100 last:border-0 ${item.warn ? "bg-amber-50/60 border-l-2 border-l-amber-300" : "hover:bg-gray-50/50"}`}>
                  <td className="px-4 py-3">
                    <div className="w-4 h-4 border-2 border-gray-200 rounded" />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 text-sm">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs border border-gray-200 bg-gray-50 text-gray-600 px-2 py-0.5 rounded">{item.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{item.qty}</td>
                  <td className={`px-4 py-3 text-sm ${item.warn ? "text-amber-700 font-semibold" : "text-gray-600"}`}>
                    {item.warn && <AlertCircle className="w-3 h-3 inline mr-1" />}
                    {item.expiry}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{item.storage}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs border px-2 py-0.5 rounded ${
                      item.warn ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-0.5">
                      {[Eye, Edit2, CheckSquare, HeartHandshake, Trash2].map((Icon, j) => (
                        <button key={j} className="text-gray-400 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors">
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500 bg-gray-50">
          <div>Showing <strong>1–8</strong> of <strong>42</strong> results</div>
          <div className="flex gap-1.5">
            <button disabled className="border border-gray-200 bg-white text-gray-400 h-8 px-3 text-xs rounded disabled:opacity-50">Previous</button>
            <button className="bg-gray-800 text-white border border-gray-800 h-8 w-8 text-xs rounded">1</button>
            <button className="border border-gray-200 bg-white text-gray-700 h-8 w-8 text-xs rounded hover:bg-gray-50">2</button>
            <button className="border border-gray-200 bg-white text-gray-700 h-8 w-8 text-xs rounded hover:bg-gray-50">3</button>
            <button className="border border-gray-200 bg-white text-gray-700 h-8 px-3 text-xs rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Modals Section */}
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold pt-2">Overlay Modals — Add / Delete / Convert to Donation</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Add Food Item */}
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Add Food Item</p>
              <h3 className="font-semibold text-gray-900 mt-0.5">New Item</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Food Name <span className="text-red-400">*</span></label>
              <input placeholder="e.g. Whole Milk" className="w-full h-8 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Quantity <span className="text-red-400">*</span></label>
                <input placeholder="1" className="w-full h-8 px-3 rounded-md border border-red-300 text-sm focus:outline-none focus:ring-1 focus:ring-red-200" />
                <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Required</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Category</label>
                <select className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-600 focus:outline-none">
                  <option>Select...</option>
                  <option>Produce</option>
                  <option>Dairy</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Expiry Date <span className="text-red-400">*</span></label>
                <input type="date" className="w-full h-8 px-2 rounded-md border border-gray-200 text-xs focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Storage</label>
                <select className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-600 focus:outline-none">
                  <option>Fridge</option>
                  <option>Pantry</option>
                  <option>Freezer</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Notes (Optional)</label>
              <textarea className="w-full h-14 rounded-md border border-gray-200 px-2 py-1.5 text-xs resize-none focus:outline-none" placeholder="Additional details..." />
            </div>
            <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span className="text-xs text-green-700 font-medium">Food item added successfully!</span>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
            <button className="border border-gray-200 text-gray-700 text-xs h-7 px-3 rounded hover:bg-gray-50">Cancel</button>
            <button className="bg-[#4CAF50] text-white text-xs h-7 px-3 rounded hover:bg-[#3d8c40]">Save Item</button>
          </div>
        </div>

        {/* Delete Confirmation */}
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Delete Food Item</p>
            <h3 className="font-semibold text-gray-900 mt-0.5">Confirm Deletion</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                <Trash2 className="w-7 h-7 text-gray-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Delete &ldquo;Whole Milk&rdquo;?</h4>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">This action cannot be undone. This item will be permanently removed from your inventory.</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Item:</span><span className="font-medium">Whole Milk</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Quantity:</span><span>1 Gallon</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Expires:</span><span>Jun 27, 2026</span></div>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex gap-2">
            <button className="flex-1 border border-gray-200 text-gray-700 text-xs h-8 rounded hover:bg-gray-50">Cancel</button>
            <button className="flex-1 bg-gray-800 text-white text-xs h-8 rounded hover:bg-gray-900">Delete Item</button>
          </div>
        </div>

        {/* Convert to Donation */}
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Convert to Donation</p>
            <h3 className="font-semibold text-gray-900 mt-0.5">Donate Item</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800 text-sm">Food Summary</p>
              <div className="flex justify-between"><span>Item:</span><span className="font-medium text-gray-800">Whole Milk</span></div>
              <div className="flex justify-between"><span>Quantity:</span><span>1 Gallon</span></div>
              <div className="flex justify-between"><span>Expires:</span><span className="text-amber-600 font-medium">Jun 27, 2026</span></div>
              <div className="flex justify-between"><span>Storage:</span><span>Fridge</span></div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Pickup Location <span className="text-red-400">*</span></label>
              <input placeholder="e.g. 123 Main St, Apt 4B" className="w-full h-8 px-3 rounded-md border border-gray-200 text-sm focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Availability</label>
              <select className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-600 focus:outline-none">
                <option>Today, 2pm–6pm</option>
                <option>Tomorrow, 9am–12pm</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Notes</label>
              <textarea className="w-full h-12 rounded-md border border-gray-200 px-2 py-1.5 text-xs resize-none focus:outline-none" placeholder="e.g. Unopened, please bring a bag" />
            </div>
            <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <HeartHandshake className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span className="text-xs text-green-700 font-medium">Donation created successfully!</span>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
            <button className="border border-gray-200 text-gray-700 text-xs h-7 px-3 rounded hover:bg-gray-50">Cancel</button>
            <button className="bg-[#4CAF50] text-white text-xs h-7 px-3 rounded hover:bg-[#3d8c40]">Confirm Donation</button>
          </div>
        </div>
      </div>
    </div>
  );
}
