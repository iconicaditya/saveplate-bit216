"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, MapPin, Search, SlidersHorizontal, X, Map as MapIcon, LayoutGrid } from "lucide-react";
import { getDonations, getDonation, updateDonation } from "@/lib/api";
import dynamic from "next/dynamic";
import { MapLocation } from "@/components/DonationMap";

// Dynamically import the map to avoid SSR issues with Leaflet
const DonationMap = dynamic(() => import("@/components/DonationMap"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">Loading map...</div>
});

const sampleMapLocations: MapLocation[] = [
  { id: "map-loc-1", lat: 40.7128, lng: -74.0060, itemName: "Fresh Organic Apples", donorName: "John D.", category: "Produce", pickupLocation: "Downtown Community Center", distance: "0.5 miles" },
  { id: "map-loc-2", lat: 40.7282, lng: -73.9942, itemName: "Whole Wheat Bread", donorName: "Sarah M.", category: "Bakery", pickupLocation: "East Village Bakery", distance: "1.2 miles" },
  { id: "map-loc-3", lat: 40.7061, lng: -74.0092, itemName: "Milk & Eggs Bundle", donorName: "Mike T.", category: "Dairy", pickupLocation: "Wall St. Metro Station", distance: "0.8 miles" },
  { id: "map-loc-4", lat: 40.7306, lng: -73.9866, itemName: "Canned Soups", donorName: "Alice W.", category: "Pantry", pickupLocation: "St. Mark's Church", distance: "1.5 miles" }
];

const categories = ["Produce", "Dairy", "Bakery", "Pantry", "Meat", "Frozen"];
const storageTypes = ["Fridge", "Freezer", "Pantry"];
const expiryOptions = ["Any", "Today", "This Week", "This Month"];

function FilterGroup({ title, values, selected, onToggle }: { title: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <section className="border-b border-gray-100 pb-5 last:border-0 last:pb-0"><h2 className="mb-3 text-sm font-semibold text-gray-900">{title}</h2><div className="space-y-2.5">{values.map((value) => <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600"><input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} className="h-4 w-4 rounded border-gray-300 accent-[#4CAF50]"/><span>{value}</span></label>)}</div></section>;
}

export default function BrowseFoodPage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [storage, setStorage] = useState<string[]>([]);
  const [expiry, setExpiry] = useState("Any");
  const [selected, setSelected] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Filter map locations based on selected categories
  const filteredMapLocations = sampleMapLocations.filter(
    loc => category.length === 0 || category.includes(loc.category)
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDonations({ search, category, storage, expiry });
      setItems(data.donations || []);
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, category, storage, expiry]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const toggle = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);

  const clearFilters = () => { setSearch(""); setCategory([]); setStorage([]); setExpiry("Any"); };

  const request = async () => {
    try {
      const result = await updateDonation(selected.id, "request");
      setMessage(result.message || "Request sent to the donor.");
      setSelected(null);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const activeCount = category.length + storage.length + (expiry !== "Any" ? 1 : 0);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Filter Sidebar */}
      <aside className="w-full shrink-0 self-start lg:sticky lg:top-6 lg:w-60">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#4CAF50]"/>
              <h1 className="font-semibold text-gray-900">Filters</h1>
              {activeCount > 0 && <span className="rounded-full bg-[#E8F5E9] px-2 py-0.5 text-[11px] font-semibold text-[#2E7D32]">{activeCount}</span>}
            </div>
            <button onClick={clearFilters} disabled={!activeCount && !search} className="text-xs font-medium text-[#2E7D32] hover:text-[#1B5E20] disabled:text-gray-300">Clear all</button>
          </div>

          {/* Category quick-filter pills for map view */}
          {viewMode === "map" && (
            <div className="mb-5 border-b border-gray-100 pb-5">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Category (Map)</h2>
              <div className="flex flex-wrap gap-1.5">
                {categories.filter(c => ["Produce", "Bakery", "Dairy", "Pantry"].includes(c)).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggle(cat, setCategory)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                      category.includes(cat)
                        ? "bg-[#4CAF50] border-[#4CAF50] text-white"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#4CAF50]/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-5">
            <FilterGroup title="Category" values={categories} selected={category} onToggle={(value) => toggle(value, setCategory)} />
            <FilterGroup title="Storage type" values={storageTypes} selected={storage} onToggle={(value) => toggle(value, setStorage)} />
            <section>
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Expiry</h2>
              <div className="space-y-2.5">
                {expiryOptions.map((value) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600">
                    <input type="radio" name="expiry" checked={expiry === value} onChange={() => setExpiry(value)} className="h-4 w-4 border-gray-300 accent-[#4CAF50]"/>
                    {value}
                  </label>
                ))}
              </div>
            </section>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 space-y-5">
        {/* Search & View Toggle Bar */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search published donations..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/15"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500"><b className="text-gray-800">{viewMode === "map" ? filteredMapLocations.length : items.length}</b> {viewMode === "map" ? "map" : "published"} {(viewMode === "map" ? filteredMapLocations.length : items.length) === 1 ? "donation" : "donations"}</p>
                <p className="text-[11px] text-gray-400">Only available listings can be claimed. Uncollected claims expire after 24 hours.</p>
              </div>
              {/* Grid / Map Toggle */}
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "grid" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                >
                  <LayoutGrid className="h-3.5 w-3.5"/> Grid
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "map" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                >
                  <MapIcon className="h-3.5 w-3.5"/> Map
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alert messages */}
        {(error || message) && (
          <div className={`flex items-center justify-between rounded-lg p-3 text-sm ${error ? "border border-red-200 bg-red-50 text-red-700" : "border border-green-200 bg-green-50 text-green-700"}`}>
            <span>{error || message}</span>
            <button onClick={() => { setError(""); setMessage(""); }} aria-label="Dismiss message"><X className="h-4 w-4"/></button>
          </div>
        )}

        {/* Map View */}
        {viewMode === "map" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {["Produce", "Bakery", "Dairy", "Pantry"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggle(cat, setCategory)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    category.includes(cat)
                      ? "bg-[#4CAF50] border-[#4CAF50] text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#4CAF50]/50 hover:bg-[#E8F5E9]"
                  }`}
                >
                  {cat} {category.includes(cat) && "✓"}
                </button>
              ))}
              {category.length > 0 && (
                <button onClick={() => setCategory([])} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-400 hover:text-gray-600">
                  Clear
                </button>
              )}
            </div>
            <DonationMap
              locations={filteredMapLocations}
              onClaim={(id) => {
                const loc = filteredMapLocations.find(l => l.id === id);
                if (loc) setMessage(`Claim request sent for: "${loc.itemName}" at ${loc.pickupLocation}`);
              }}
            />
            {filteredMapLocations.length === 0 && (
              <p className="rounded-xl border border-gray-200 bg-white py-10 text-center text-sm text-gray-500">
                No map locations match the selected categories. Try clearing your filters.
              </p>
            )}
          </div>
        ) : (
          /* Grid View */
          loading ? (
            <div className="grid place-items-center rounded-xl border border-gray-200 bg-white py-20 text-sm text-gray-500">Loading donations…</div>
          ) : items.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((donation) => (
                <article key={donation.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="h-40 bg-gray-100">
                    {donation.foodItem.imageUrl
                      ? <img src={donation.foodItem.imageUrl} alt={donation.foodItem.name} className="h-full w-full object-cover"/>
                      : <div className="grid h-full place-items-center text-sm text-gray-400">No image available</div>
                    }
                  </div>
                  <div className="space-y-2.5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold text-gray-900">{donation.foodItem.name}</h2>
                      <span className="shrink-0 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">{donation.foodItem.category}</span>
                    </div>
                    <p className="text-sm text-gray-600"><span className="text-gray-400">Quantity:</span> {donation.foodItem.quantity} {donation.foodItem.unit}</p>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500"><Clock className="h-3.5 w-3.5"/>Use by {new Date(donation.foodItem.expiryDate).toLocaleDateString()}</p>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin className="h-3.5 w-3.5"/>{donation.donor.location || "Nearby household"}</p>
                    <p className="text-xs text-gray-400">Shared by {donation.donor.firstName} {donation.donor.lastName?.[0]}.</p>
                    <button
                      onClick={async () => { try { setSelected((await getDonation(donation.id)).donation); } catch (e: any) { setError(e.message); } }}
                      className="mt-1 h-9 w-full rounded-md border border-[#4CAF50]/40 text-sm font-medium text-[#2E7D32] transition hover:bg-[#E8F5E9]"
                    >
                      Claim item
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
              <Search className="mx-auto h-8 w-8 text-gray-300"/>
              <p className="mt-3 text-sm font-medium text-gray-900">No donations found</p>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          )
        )}
      </main>

      {/* Request Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
          <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">Request {selected.foodItem.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{selected.foodItem.quantity} {selected.foodItem.unit} · Available {selected.availability}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close request dialog"><X className="h-5 w-5 text-gray-500"/></button>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Your request is sent to the donor for approval. The pickup address is shared only after approval.</div>
            <button onClick={request} className="h-10 w-full rounded-md bg-[#4CAF50] text-sm font-medium text-white hover:bg-[#3d8c40]">Send request</button>
          </div>
        </div>
      )}
    </div>
  );
}
