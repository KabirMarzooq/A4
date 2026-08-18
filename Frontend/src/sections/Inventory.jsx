import React, { useState, useEffect } from "react";
import {
  Pill,
  Plus,
  Search,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  Pencil,
  Trash2,
  PackagePlus,
  ChevronDown,
  Filter,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

const UNIT_TYPES = [
  "Tablets",
  "Capsules",
  "Syrup",
  "Injection",
  "Cream",
  "Ointment",
  "Drops",
  "Inhaler",
  "Suppository",
  "Patch",
  "Powder",
  "Solution",
];

const CATEGORIES = [
  "Antibiotic",
  "Painkiller",
  "Antihypertensive",
  "Antidiabetic",
  "Antifungal",
  "Antiparasitic",
  "Antiviral",
  "Antihistamine",
  "Antacid",
  "Vitamin & Supplement",
  "Cardiovascular",
  "Respiratory",
  "Gastrointestinal",
  "Hormonal",
  "Neurological",
  "Dermatological",
  "Other",
];

const emptyForm = {
  name: "",
  category: "",
  unit_type: "",
  unit_price: "",
  stock_quantity: "",
  low_stock_threshold: "10",
  description: "",
};

export default function Inventory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(null); // holds drug being restocked
  const [editingDrug, setEditingDrug] = useState(null); // holds drug being edited
  const [deleteConfirm, setDeleteConfirm] = useState(null); // holds drug to delete

  const fetchDrugs = async (search = "", category = "") => {
    try {
      const res = await api.get("/pharmacy/drugs", {
        params: { search, category },
      });
      setData(res.data);
    } catch {
      toast.error("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchDrugs(searchTerm, filterCategory), 350);
    return () => clearTimeout(timer);
  }, [searchTerm, filterCategory]);

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading inventory...
      </div>
    );

  const drugs = data?.drugs || [];
  const alerts = data?.alerts || {};
  const categories = data?.categories || [];

  return (
    <div className="p-2 sm:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Drug Inventory
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage stock levels and drug pricing
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDrug(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} /> Add Drug
        </button>
      </div>

      {/* Stock Alert Banner */}
      {(alerts.out_of_stock > 0 || alerts.low_stock > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {alerts.out_of_stock > 0 && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl px-5 py-4">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-700 dark:text-red-400 text-sm">
                  {alerts.out_of_stock} drug{alerts.out_of_stock > 1 ? "s" : ""}{" "}
                  out of stock
                </p>
                <p className="text-xs text-red-600/70 dark:text-red-500/70">
                  Immediate restocking required
                </p>
              </div>
            </div>
          )}
          {alerts.low_stock > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl px-5 py-4">
              <AlertTriangle
                size={20}
                className="text-amber-500 flex-shrink-0"
              />
              <div>
                <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                  {alerts.low_stock} drug{alerts.low_stock > 1 ? "s" : ""}{" "}
                  running low
                </p>
                <p className="text-xs text-amber-600/70 dark:text-amber-500/70">
                  Consider restocking soon
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search + Category Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search drugs by name..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={16}
          />
          <select
            className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-10 pr-10 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={16}
          />
        </div>
      </div>

      {/* Drug Table */}
      {drugs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5">
            <Pill size={36} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-slate-700 dark:text-slate-300 font-bold text-lg mb-2">
            {searchTerm || filterCategory
              ? "No drugs found"
              : "Inventory is empty"}
          </h3>
          <p className="text-slate-400 text-sm max-w-sm">
            {searchTerm || filterCategory
              ? "Try adjusting your search or filter."
              : 'Click "Add Drug" to add the first drug to your inventory.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {[
                    "Drug Name",
                    "Category",
                    "Unit Type",
                    "Unit Price",
                    "Stock Qty",
                    "Low Stock Alert",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`p-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest ${
                        h === "Actions" ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {drugs.map((drug) => (
                  <DrugRow
                    key={drug.id}
                    drug={drug}
                    onEdit={() => {
                      setEditingDrug(drug);
                      setIsFormOpen(true);
                    }}
                    onRestock={() => setIsRestockOpen(drug)}
                    onDelete={() => setDeleteConfirm(drug)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Drug Form */}
      <DrugForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDrug(null);
        }}
        editingDrug={editingDrug}
        onSaved={() => {
          fetchDrugs(searchTerm, filterCategory);
          setIsFormOpen(false);
          setEditingDrug(null);
        }}
      />

      {/* Restock Modal */}
      {isRestockOpen && (
        <RestockModal
          drug={isRestockOpen}
          onClose={() => setIsRestockOpen(null)}
          onRestocked={() => {
            fetchDrugs(searchTerm, filterCategory);
            setIsRestockOpen(null);
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <DeleteModal
          drug={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onDeleted={() => {
            fetchDrugs(searchTerm, filterCategory);
            setDeleteConfirm(null);
          }}
        />
      )}
    </div>
  );
}

function DrugRow({ drug, onEdit, onRestock, onDelete }) {
  const statusConfig = {
    in_stock: {
      label: "In Stock",
      icon: <CheckCircle size={13} />,
      style:
        "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 border-teal-200 dark:border-teal-500/30",
    },
    low_stock: {
      label: "Low Stock",
      icon: <AlertTriangle size={13} />,
      style:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    },
    out_of_stock: {
      label: "Out of Stock",
      icon: <AlertCircle size={13} />,
      style:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30",
    },
  };

  const status = statusConfig[drug.stock_status] || statusConfig.in_stock;

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Pill size={16} className="text-teal-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {drug.name}
            </p>
            {drug.description && (
              <p className="text-xs text-slate-400 truncate max-w-[160px]">
                {drug.description}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="p-4">
        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium">
          {drug.category}
        </span>
      </td>

      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
        {drug.unit_type}
      </td>

      <td className="p-4">
        <span className="font-bold text-slate-900 dark:text-white text-sm">
          ₦
          {Number(drug.unit_price).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })}
        </span>
      </td>

      <td className="p-4">
        <span
          className={`font-black text-lg ${
            drug.stock_quantity <= 0
              ? "text-red-500"
              : drug.stock_quantity <= drug.low_stock_threshold
              ? "text-amber-500"
              : "text-slate-900 dark:text-white"
          }`}
        >
          {drug.stock_quantity}
        </span>
      </td>

      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
        ≤ {drug.low_stock_threshold} units
      </td>

      <td className="p-4">
        <span
          className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${status.style}`}
        >
          {status.icon} {status.label}
        </span>
      </td>

      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onRestock}
            title="Add Stock"
            className="p-2 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <PackagePlus size={17} />
          </button>

          <button
            onClick={onEdit}
            title="Edit Drug"
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={onDelete}
            title="Remove Drug"
            className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function DrugForm({ isOpen, onClose, editingDrug, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingDrug) {
      setForm({
        name: editingDrug.name,
        category: editingDrug.category,
        unit_type: editingDrug.unit_type,
        unit_price: editingDrug.unit_price,
        stock_quantity: editingDrug.stock_quantity,
        low_stock_threshold: editingDrug.low_stock_threshold,
        description: editingDrug.description || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingDrug, isOpen]);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.unit_type || !form.unit_price) {
      return toast.error("Please fill in all required fields.");
    }
    setSaving(true);
    try {
      if (editingDrug) {
        await api.patch(`/pharmacy/drugs/${editingDrug.id}`, form);
        toast.success("Drug updated successfully.");
      } else {
        await api.post("/pharmacy/drugs", form);
        toast.success("Drug added to inventory.");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save drug.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 p-8 transform transition-transform duration-300 border-l border-slate-200 dark:border-slate-700 overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editingDrug ? "Edit Drug" : "Add New Drug"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {editingDrug
                ? "Update drug details and pricing"
                : "Add a new drug to your inventory"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Drug Name *">
            <input
              type="text"
              placeholder="e.g. Amoxicillin 500mg"
              className={inputClass}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </FormField>

          <FormField label="Category *">
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Unit Type *">
            <select
              className={inputClass}
              value={form.unit_type}
              onChange={(e) => set("unit_type", e.target.value)}
            >
              <option value="">Select unit type</option>
              {UNIT_TYPES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Unit Price (₦) *">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₦
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`${inputClass} pl-8`}
                value={form.unit_price}
                onChange={(e) => set("unit_price", e.target.value)}
              />
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Stock Quantity *">
              <input
                type="number"
                min="0"
                placeholder="0"
                className={inputClass}
                value={form.stock_quantity}
                onChange={(e) => set("stock_quantity", e.target.value)}
              />
            </FormField>
            <FormField label="Low Stock Alert ≤">
              <input
                type="number"
                min="1"
                placeholder="10"
                className={inputClass}
                value={form.low_stock_threshold}
                onChange={(e) => set("low_stock_threshold", e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Description (optional)">
            <textarea
              rows={3}
              placeholder="Drug usage notes, warnings, etc."
              className={`${inputClass} resize-none`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </FormField>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/25 cursor-pointer"
          >
            {saving
              ? "Saving..."
              : editingDrug
              ? "Save Changes"
              : "Add to Inventory"}
          </button>
        </form>
      </div>
    </div>
  );
}

function RestockModal({ drug, onClose, onRestocked }) {
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || quantity < 1)
      return toast.error("Enter a valid quantity.");
    setSaving(true);
    try {
      await api.patch(`/pharmacy/drugs/${drug.id}/restock`, { quantity });
      toast.success(`Added ${quantity} units to ${drug.name}.`);
      onRestocked();
    } catch {
      toast.error("Failed to restock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-700 shadow-2xl z-10">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Stock
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">{drug.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Current Stock
            </p>
            <p
              className={`text-2xl font-black ${
                drug.stock_quantity <= 0
                  ? "text-red-500"
                  : drug.stock_quantity <= drug.low_stock_threshold
                  ? "text-amber-500"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {drug.stock_quantity}
            </p>
          </div>
          <div className="flex-1 bg-teal-50 dark:bg-teal-500/10 rounded-2xl p-3 border border-teal-100 dark:border-teal-500/20 text-center">
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
              After Restock
            </p>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400">
              {drug.stock_quantity + (parseInt(quantity) || 0)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Units to Add">
            <input
              type="number"
              min="1"
              placeholder="Enter quantity"
              className={inputClass}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              autoFocus
            />
          </FormField>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              {saving ? "Adding..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ drug, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/pharmacy/drugs/${drug.id}`);
      toast.success(`${drug.name} removed from inventory.`);
      onDeleted();
    } catch {
      toast.error("Failed to delete drug.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-700 shadow-2xl z-10">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-1">
          Remove Drug
        </h3>
        <p className="text-slate-500 text-sm text-center mb-5">
          Are you sure you want to remove{" "}
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {drug.name}
          </span>{" "}
          from inventory? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-red-500/20 cursor-pointer"
          >
            {deleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 text-sm";

const FormField = ({ label, children }) => (
  <div>
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
      {label}
    </label>
    {children}
  </div>
);
