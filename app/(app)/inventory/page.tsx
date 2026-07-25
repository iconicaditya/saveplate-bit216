"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { Search, Plus, Eye, Edit2, CheckSquare, HeartHandshake, Trash2, AlertCircle, X, ImageOff } from "lucide-react";
import { getInventoryItems, createFoodItem, updateFoodItem, deleteFoodItem } from "@/lib/api";

interface FoodItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  expiryDate: string;
  storage: string;
  status: string;
  notes: string | null;
  imageUrl: string | null;
}

export default function InventoryPage() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [storageFilter, setStorageFilter] = useState("All");
  const [expiryFilter, setExpiryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    category: "Produce",
    quantity: "",
    unit: "items",
    expiryDate: "",
    storage: "Fridge",
    notes: "",
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<FoodItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Donation state
  const [donateTarget, setDonateTarget] = useState<FoodItem | null>(null);
  const [donateForm, setDonateForm] = useState({ pickupLocation: "", availability: "Today, 2pm–6pm", notes: "" });
  const [isDonating, setIsDonating] = useState(false);
  const [donateSuccess, setDonateSuccess] = useState(false);

  // View state
  const [viewItem, setViewItem] = useState<FoodItem | null>(null);

  // Edit state
  const [editItem, setEditItem] = useState<FoodItem | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", quantity: "", unit: "", expiryDate: "", storage: "", notes: "" });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // Mark as Used state
  const [markUsedTarget, setMarkUsedTarget] = useState<FoodItem | null>(null);
  const [isMarkingUsed, setIsMarkingUsed] = useState(false);
  const [markUsedSuccess, setMarkUsedSuccess] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getInventoryItems({
        category: categoryFilter !== "All" ? categoryFilter : undefined,
        storage: storageFilter !== "All" ? storageFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        expiry: expiryFilter !== "All" ? expiryFilter : undefined,
        search: search || undefined,
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load inventory.");
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, storageFilter, statusFilter, expiryFilter, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── Add Item ──────────────────────────────────────────────────

  function validateAddForm(): boolean {
    const errs: Record<string, string> = {};
    if (!addForm.name.trim()) errs.name = "Food name is required.";
    if (!addForm.quantity.trim()) errs.quantity = "Quantity is required.";
    if (!addForm.expiryDate) errs.expiryDate = "Expiry date is required.";
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateAddForm()) return;
    setIsAdding(true);
    setAddSuccess(false);
    try {
      let imageUrl = "";
      if (addImageFile) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('image', addImageFile);
        const token = localStorage.getItem('saveplate_token');
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Image upload failed.');
        imageUrl = uploadData.url;
        setIsUploadingImage(false);
      }
      await createFoodItem({ ...addForm, imageUrl });
      setAddSuccess(true);
      setAddForm({ name: "", category: "Produce", quantity: "", unit: "items", expiryDate: "", storage: "Fridge", notes: "" });
      setAddImageFile(null);
      setAddImagePreview(null);
      setAddErrors({});
      fetchItems();
      setTimeout(() => setShowAddForm(false), 1200);
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (err: any) {
      setAddErrors({ form: err.message || "Failed to add item." });
    } finally {
      setIsAdding(false);
      setIsUploadingImage(false);
    }
  }

  // ─── Delete Item ───────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteFoodItem(deleteTarget.id);
      setDeleteSuccess(true);
      fetchItems();
      setTimeout(() => {
        setDeleteSuccess(false);
        setDeleteTarget(null);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to delete item.");
    } finally {
      setIsDeleting(false);
    }
  }

  // ─── Donate Item ───────────────────────────────────────────────

  function openDonate(item: FoodItem) {
    setDonateTarget(item);
    setDonateForm({ pickupLocation: "", availability: "Today, 2pm–6pm", notes: "" });
    setDonateSuccess(false);
  }

  async function handleDonate() {
    if (!donateTarget) return;
    if (!donateForm.pickupLocation.trim()) {
      setError("Pickup location is required to create a donation.");
      return;
    }
    setIsDonating(true);
    try {
      await deleteFoodItem(donateTarget.id);
      setDonateSuccess(true);
      fetchItems();
      setTimeout(() => {
        setDonateSuccess(false);
        setDonateTarget(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to process donation.");
    } finally {
      setIsDonating(false);
    }
  }

  // ─── Mark as Used ──────────────────────────────────────────────

  async function handleMarkAsUsed() {
    if (!markUsedTarget) return;
    setIsMarkingUsed(true);
    try {
      await deleteFoodItem(markUsedTarget.id);
      setMarkUsedSuccess(true);
      fetchItems();
      setTimeout(() => {
        setMarkUsedSuccess(false);
        setMarkUsedTarget(null);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to mark item as used.");
    } finally {
      setIsMarkingUsed(false);
    }
  }

  // ─── Edit Item ─────────────────────────────────────────────────

  function openEdit(item: FoodItem) {
    setEditItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate.split("T")[0],
      storage: item.storage,
      notes: item.notes || "",
    });
    setEditErrors({});
    setEditSuccess(false);
  }

  function validateEditForm(): boolean {
    const errs: Record<string, string> = {};
    if (!editForm.name.trim()) errs.name = "Food name is required.";
    if (!editForm.quantity.trim()) errs.quantity = "Quantity is required.";
    if (!editForm.expiryDate) errs.expiryDate = "Expiry date is required.";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editItem || !validateEditForm()) return;
    setIsEditing(true);
    try {
      await updateFoodItem(editItem.id, editForm);
      setEditSuccess(true);
      fetchItems();
      setTimeout(() => { setEditSuccess(false); setEditItem(null); }, 1200);
    } catch (err: any) {
      setEditErrors({ form: err.message || "Failed to update item." });
    } finally {
      setIsEditing(false);
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const totalPages = Math.ceil(total / pageSize);
  const displayedItems = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex gap-2 flex-1 flex-wrap">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search food items..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 bg-white border border-gray-200 h-9 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:outline-none">
            <option>Category: All</option>
            <option>Produce</option><option>Dairy</option><option>Pantry</option><option>Frozen</option><option>Meat</option><option>Bakery</option><option>Other</option>
          </select>
          <select value={storageFilter} onChange={(e) => { setStorageFilter(e.target.value); setPage(1); }} className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:outline-none">
            <option>Storage: All</option>
            <option>Fridge</option><option>Pantry</option><option>Freezer</option>
          </select>
          <select value={expiryFilter} onChange={(e) => { setExpiryFilter(e.target.value); setPage(1); }} className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:outline-none">
            <option>Expiry: All</option>
            <option>Today</option><option>This Week</option><option>This Month</option>
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 focus:outline-none">
            <option>Status: All</option>
            <option>Fresh</option><option>Expiring Soon</option><option>Expired</option>
          </select>
        </div>
        <button onClick={() => { setShowAddForm(true); setAddSuccess(false); setAddErrors({}); }} className="flex items-center gap-2 bg-[#4CAF50] text-white text-sm font-medium px-4 h-9 rounded-md hover:bg-[#3d8c40] transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-gray-400">
          <svg className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-600 rounded-full mb-3" viewBox="0 0 24 24" />
          <p className="text-sm">Loading inventory...</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-8"><div className="w-4 h-4 border-2 border-gray-300 rounded" /></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide w-20">Image</th>
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
                  {displayedItems.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">No food items found. Add your first item!</td></tr>
                  ) : (
                    displayedItems.map((item) => {
                      const warn = item.status === "Expiring Soon" || item.status === "Expired";
                      return (
                        <tr key={item.id} className={`border-b border-gray-100 last:border-0 ${warn ? "bg-amber-50/60 border-l-2 border-l-amber-300" : "hover:bg-gray-50/50"}`}>
                          <td className="px-4 py-3"><div className="w-4 h-4 border-2 border-gray-200 rounded" /></td>
                          <td className="px-4 py-3">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 bg-gray-50"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300" title="No image">
                                <ImageOff className="w-5 h-5" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 text-sm">{item.name}</td>
                          <td className="px-4 py-3"><span className="text-xs border border-gray-200 bg-gray-50 text-gray-600 px-2 py-0.5 rounded">{item.category}</span></td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{item.quantity} {item.unit}</td>
                          <td className={`px-4 py-3 text-sm ${warn ? "text-amber-700 font-semibold" : "text-gray-600"}`}>
                            {warn && <AlertCircle className="w-3 h-3 inline mr-1" />}{formatDate(item.expiryDate)}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{item.storage}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs border px-2 py-0.5 rounded ${warn ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>{item.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-0.5">
                              <button onClick={() => setViewItem(item)} className="text-gray-400 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => setMarkUsedTarget(item)} className="text-gray-400 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors" title="Mark as Used"><CheckSquare className="w-4 h-4" /></button>
                              <button onClick={() => openDonate(item)} className="text-gray-400 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors" title="Donate"><HeartHandshake className="w-4 h-4" /></button>
                              <button onClick={() => setDeleteTarget(item)} className="text-gray-400 hover:text-gray-700 h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500 bg-gray-50">
              <div>Showing <strong>1–{Math.min(pageSize, displayedItems.length)}</strong> of <strong>{total}</strong> results</div>
              <div className="flex gap-1.5">
                <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="border border-gray-200 bg-white text-gray-400 h-8 px-3 text-xs rounded disabled:opacity-50">Previous</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 text-xs rounded ${page === p ? "bg-gray-800 text-white border border-gray-800" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>{p}</button>
                ))}
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border border-gray-200 bg-white text-gray-700 h-8 px-3 text-xs rounded hover:bg-gray-50">Next</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── Add Food Item Modal ──────────────────────────────── */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/30 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-8 overflow-y-auto" onClick={() => { if (!isAdding) { setShowAddForm(false); setAddErrors({}); } }}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-lg w-full my-auto max-h-[90vh] sm:max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Add Food Item</p>
                <h3 className="font-semibold text-gray-900 mt-0.5">New Item</h3>
              </div>
              <button onClick={() => { setShowAddForm(false); setAddErrors({}); setAddSuccess(false); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="flex flex-col min-h-0 flex-1">
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto">
                {addErrors.form && <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded">{addErrors.form}</div>}

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Food Name <span className="text-red-400">*</span></label>
                  <input placeholder="e.g. Whole Milk" value={addForm.name} onChange={(e) => { setAddForm(f => ({ ...f, name: e.target.value })); if (addErrors.name) setAddErrors(p => ({ ...p, name: "" })); }} className={`w-full h-10 px-4 rounded-xl border bg-gray-50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${addErrors.name ? "border-red-400 bg-red-50" : "border-gray-200"}`} autoFocus />
                  {addErrors.name && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{addErrors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Quantity <span className="text-red-400">*</span></label>
                    <input placeholder="1" value={addForm.quantity} onChange={(e) => { setAddForm(f => ({ ...f, quantity: e.target.value })); if (addErrors.quantity) setAddErrors(p => ({ ...p, quantity: "" })); }} className={`w-full h-10 px-4 rounded-xl border bg-gray-50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${addErrors.quantity ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    {addErrors.quantity && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{addErrors.quantity}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Unit</label>
                    <select value={addForm.unit} onChange={(e) => setAddForm(f => ({ ...f, unit: e.target.value }))} className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]">
                      <option>items</option><option>lbs</option><option>oz</option><option>cups</option><option>cans</option><option>boxes</option><option>bags</option><option>bottles</option><option>gallons</option><option>loaves</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Category</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {["Produce", "Dairy", "Bakery", "Pantry", "Meat", "Frozen", "Other"].map((c) => (
                        <button key={c} type="button" onClick={() => setAddForm(f => ({ ...f, category: c }))} className={`h-9 rounded-lg border text-xs font-medium transition-colors ${addForm.category === c ? "bg-[#4CAF50] text-white border-[#4CAF50]" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Storage Type</label>
                    <div className="space-y-2">
                      {["Fridge", "Freezer", "Pantry"].map((s) => (
                        <label key={s} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <div className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 ${addForm.storage === s ? "border-[#4CAF50] bg-[#4CAF50]" : "border-gray-300 bg-white"}`} onClick={() => setAddForm(f => ({ ...f, storage: s }))}>
                            {addForm.storage === s && <div className="w-2 h-2 bg-white rounded-sm" />}
                          </div>
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Expiry Date <span className="text-red-400">*</span></label>
                  <input type="date" value={addForm.expiryDate} onChange={(e) => { setAddForm(f => ({ ...f, expiryDate: e.target.value })); if (addErrors.expiryDate) setAddErrors(p => ({ ...p, expiryDate: "" })); }} className={`w-full h-10 px-4 rounded-xl border bg-gray-50 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] ${addErrors.expiryDate ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                  {addErrors.expiryDate && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{addErrors.expiryDate}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Food Image <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAddImageFile(file);
                            setAddImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#4CAF50]/10 file:text-[#4CAF50] hover:file:bg-[#4CAF50]/20 transition-colors"
                      />
                    </div>
                    {addImagePreview && (
                      <div className="relative shrink-0">
                        <img src={addImagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                        <button type="button" onClick={() => { setAddImageFile(null); setAddImagePreview(null); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                  {isUploadingImage && <p className="text-xs text-gray-500 flex items-center gap-1"><svg className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full" viewBox="0 0 24 24" /> Uploading image...</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea value={addForm.notes} onChange={(e) => setAddForm(f => ({ ...f, notes: e.target.value }))} className="w-full h-16 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" placeholder="Additional details..." />
                </div>

                {addSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm text-green-700 font-medium">Food item added successfully!</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl shrink-0">
                <button type="button" onClick={() => { setShowAddForm(false); setAddErrors({}); setAddSuccess(false); }} className="px-5 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isAdding} className="px-5 py-2 bg-[#4CAF50] text-white text-sm font-medium rounded-lg hover:bg-[#3d8c40] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
                  {isAdding ? <><svg className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" viewBox="0 0 24 24" /> Saving...</> : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── View Item Modal ──────────────────────────────────────── */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/30 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-8 overflow-y-auto" onClick={() => setViewItem(null)}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-md w-full p-4 sm:p-6 my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {viewItem.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={viewItem.imageUrl} alt={viewItem.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 shrink-0">
                    <ImageOff className="w-6 h-6" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 text-lg truncate">{viewItem.name}</h3>
              </div>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Category</span><span className="font-medium">{viewItem.category}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Quantity</span><span className="font-medium">{viewItem.quantity} {viewItem.unit}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Expiry Date</span><span className="font-medium">{formatDate(viewItem.expiryDate)}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Storage</span><span className="font-medium">{viewItem.storage}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Status</span><span className={`font-medium ${viewItem.status === "Expiring Soon" ? "text-amber-600" : viewItem.status === "Expired" ? "text-red-600" : "text-green-600"}`}>{viewItem.status}</span></div>
              {viewItem.notes && <div className="flex justify-between py-2"><span className="text-gray-500">Notes</span><span className="font-medium text-right max-w-[60%]">{viewItem.notes}</span></div>}
            </div>
          </div>
        </div>
      )}

      {/* ─── Mark as Used Modal ───────────────────────────────────── */}
      {markUsedTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-8 overflow-y-auto" onClick={() => setMarkUsedTarget(null)}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-sm w-full p-4 sm:p-6 my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center space-y-3 mb-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-200"><CheckSquare className="w-7 h-7 text-green-600" /></div>
              <div>
                <h4 className="font-semibold text-gray-900">Mark as Used?</h4>
                <p className="text-sm text-gray-500 mt-1">Confirm that you&rsquo;ve used &ldquo;{markUsedTarget.name}&rdquo;. It will be removed from your inventory.</p>
              </div>
            </div>
            {markUsedSuccess && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mb-3">
                <CheckSquare className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="text-xs text-green-700 font-medium">Item marked as used!</span>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setMarkUsedTarget(null)} className="flex-1 border border-gray-200 text-gray-700 text-xs h-8 rounded hover:bg-gray-50">Cancel</button>
              <button onClick={handleMarkAsUsed} disabled={isMarkingUsed} className="flex-1 bg-[#4CAF50] text-white text-xs h-8 rounded hover:bg-[#3d8c40] disabled:opacity-60 flex items-center justify-center gap-1">
                {isMarkingUsed ? <><svg className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" viewBox="0 0 24 24" /> Processing...</> : "Confirm Used"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-8 overflow-y-auto" onClick={() => { if (!isDeleting) { setDeleteTarget(null); setDeleteSuccess(false); } }}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-sm w-full p-4 sm:p-6 my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center space-y-3 mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-200"><Trash2 className="w-7 h-7 text-red-600" /></div>
              <div>
                <h4 className="font-semibold text-gray-900">Delete &ldquo;{deleteTarget.name}&rdquo;?</h4>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">This action cannot be undone. This item will be permanently removed from your inventory.</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 space-y-1 mb-3">
              <div className="flex justify-between"><span className="text-gray-500">Item:</span><span className="font-medium">{deleteTarget.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Quantity:</span><span>{deleteTarget.quantity} {deleteTarget.unit}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Expires:</span><span>{formatDate(deleteTarget.expiryDate)}</span></div>
            </div>
            {deleteSuccess && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mb-3">
                <CheckSquare className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="text-xs text-green-700 font-medium">Item deleted successfully!</span>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setDeleteTarget(null); setDeleteSuccess(false); }} disabled={isDeleting} className="flex-1 border border-gray-200 text-gray-700 text-xs h-8 rounded hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-gray-800 text-white text-xs h-8 rounded hover:bg-gray-900 disabled:opacity-60 flex items-center justify-center gap-1">
                {isDeleting ? <><svg className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" viewBox="0 0 24 24" /> Deleting...</> : "Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Donate Item Modal ────────────────────────────────────── */}
      {donateTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-8 overflow-y-auto" onClick={() => { if (!isDonating) { setDonateTarget(null); setDonateSuccess(false); } }}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-md w-full p-4 sm:p-6 my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {donateTarget.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={donateTarget.imageUrl} alt={donateTarget.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 shrink-0">
                    <ImageOff className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Convert to Donation</p>
                  <h3 className="font-semibold text-gray-900 mt-0.5 truncate">Donate &ldquo;{donateTarget.name}&rdquo;</h3>
                </div>
              </div>
              <button onClick={() => { setDonateTarget(null); setDonateSuccess(false); }} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 space-y-1 mb-4">
              <p className="font-semibold text-gray-800 text-sm">Food Summary</p>
              <div className="flex justify-between"><span>Item:</span><span className="font-medium text-gray-800">{donateTarget.name}</span></div>
              <div className="flex justify-between"><span>Quantity:</span><span>{donateTarget.quantity} {donateTarget.unit}</span></div>
              <div className="flex justify-between"><span>Expires:</span><span className="text-amber-600 font-medium">{formatDate(donateTarget.expiryDate)}</span></div>
              <div className="flex justify-between"><span>Storage:</span><span>{donateTarget.storage}</span></div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Pickup Location <span className="text-red-400">*</span></label>
                <input placeholder="e.g. 123 Main St, Apt 4B" value={donateForm.pickupLocation} onChange={(e) => setDonateForm(f => ({ ...f, pickupLocation: e.target.value }))} className="w-full h-8 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Availability</label>
                <select value={donateForm.availability} onChange={(e) => setDonateForm(f => ({ ...f, availability: e.target.value }))} className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-600 focus:outline-none">
                  <option>Today, 2pm–6pm</option><option>Tomorrow, 9am–12pm</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Notes</label>
                <textarea value={donateForm.notes} onChange={(e) => setDonateForm(f => ({ ...f, notes: e.target.value }))} className="w-full h-14 rounded-md border border-gray-200 px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-gray-300" placeholder="e.g. Unopened, please bring a bag" />
              </div>
            </div>
            {donateSuccess && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mt-3">
                <HeartHandshake className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="text-xs text-green-700 font-medium">Donation created successfully!</span>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-gray-100">
              <button onClick={() => { setDonateTarget(null); setDonateSuccess(false); }} disabled={isDonating} className="border border-gray-200 text-gray-700 text-xs h-8 px-3 rounded hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleDonate} disabled={isDonating} className="bg-[#4CAF50] text-white text-xs h-8 px-3 rounded hover:bg-[#3d8c40] disabled:opacity-60 flex items-center gap-1">
                {isDonating ? <><svg className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" viewBox="0 0 24 24" /> Processing...</> : "Confirm Donation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Item Modal ──────────────────────────────────────── */}
      {editItem && (
        <div className="fixed inset-0 bg-black/30 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-8 overflow-y-auto" onClick={() => setEditItem(null)}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-md w-full p-4 sm:p-6 my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {editItem.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editItem.imageUrl} alt={editItem.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 shrink-0">
                    <ImageOff className="w-5 h-5" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 text-lg truncate">Edit Item</h3>
              </div>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              {editErrors.form && <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded">{editErrors.form}</div>}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Food Name <span className="text-red-400">*</span></label>
                <input value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className={`w-full h-8 px-3 rounded-md border text-sm focus:outline-none ${editErrors.name ? "border-red-300" : "border-gray-200"}`} />
                {editErrors.name && <p className="text-[10px] text-red-500">{editErrors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Quantity <span className="text-red-400">*</span></label>
                  <input value={editForm.quantity} onChange={(e) => setEditForm(f => ({ ...f, quantity: e.target.value }))} className={`w-full h-8 px-3 rounded-md border text-sm focus:outline-none ${editErrors.quantity ? "border-red-300" : "border-gray-200"}`} />
                  {editErrors.quantity && <p className="text-[10px] text-red-500">{editErrors.quantity}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Category</label>
                  <select value={editForm.category} onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))} className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs focus:outline-none">
                    <option>Produce</option><option>Dairy</option><option>Pantry</option><option>Frozen</option><option>Meat</option><option>Bakery</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Expiry Date <span className="text-red-400">*</span></label>
                  <input type="date" value={editForm.expiryDate} onChange={(e) => setEditForm(f => ({ ...f, expiryDate: e.target.value }))} className={`w-full h-8 px-2 rounded-md border text-xs focus:outline-none ${editErrors.expiryDate ? "border-red-300" : "border-gray-200"}`} />
                  {editErrors.expiryDate && <p className="text-[10px] text-red-500">{editErrors.expiryDate}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Storage</label>
                  <select value={editForm.storage} onChange={(e) => setEditForm(f => ({ ...f, storage: e.target.value }))} className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-xs focus:outline-none">
                    <option>Fridge</option><option>Pantry</option><option>Freezer</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Notes</label>
                <textarea value={editForm.notes} onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))} className="w-full h-14 rounded-md border border-gray-200 px-2 py-1.5 text-xs resize-none focus:outline-none" />
              </div>
              {editSuccess && (
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span className="text-xs text-green-700 font-medium">Item updated successfully!</span>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditItem(null)} className="border border-gray-200 text-gray-700 text-xs h-7 px-3 rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isEditing} className="bg-[#4CAF50] text-white text-xs h-7 px-3 rounded hover:bg-[#3d8c40] disabled:opacity-60 flex items-center gap-1">
                  {isEditing ? <><svg className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" viewBox="0 0 24 24" /> Updating...</> : "Update Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
