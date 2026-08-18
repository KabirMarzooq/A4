import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Clock,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  Pill,
  TrendingUp,
  X,
  AlertTriangle,
  Lock,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

const formatNGN = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function PharmacySales() {
  const [todaySale, setTodaySale] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingHistory, setViewingHistory] = useState(null);
  const [activeTab, setActiveTab] = useState("today");
  const [closing, setClosing] = useState(false);

  const fetchToday = async () => {
    try {
      const res = await api.get("/pharmacy/sales/today");
      setTodaySale(res.data.today);
      setHistory(res.data.history);
    } catch {
      toast.error("Failed to load sales data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleCloseSale = async () => {
    if (!window.confirm("Close today's sale? This cannot be undone.")) return;
    setClosing(true);
    try {
      await api.patch("/pharmacy/sales/close");
      toast.success("Today's sale has been closed.");
      await fetchToday();
      setActiveTab("history");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to close sale.");
    } finally {
      setClosing(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading pharmacy sales...
      </div>
    );

  // Show history detail view
  if (viewingHistory) {
    return (
      <HistoryDetail
        saleId={viewingHistory}
        onBack={() => setViewingHistory(null)}
      />
    );
  }

  const isClosed = todaySale?.status === "closed";
  const items = todaySale?.items || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Pharmacy Sales
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {formatDate(todaySale?.sale_date || new Date())}
          </p>
        </div>

        {!isClosed && (
          <button
            onClick={handleCloseSale}
            disabled={closing || items.length === 0}
            className="flex items-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all cursor-pointer"
          >
            <Lock size={15} />
            {closing ? "Closing..." : "Close Today's Sale"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-6">
        {[
          { id: "today", label: "Today's Sales" },
          { id: "history", label: `History (${history.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-800 text-teal-600 border border-b-white dark:border-slate-700 dark:border-b-slate-800 -mb-px"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "today" && (
        <TodaySalesTab
          sale={todaySale}
          items={items}
          isClosed={isClosed}
          onRefresh={fetchToday}
        />
      )}

      {activeTab === "history" && (
        <HistoryTab history={history} onView={(id) => setViewingHistory(id)} />
      )}
    </div>
  );
}

// ── TODAY'S SALES TAB ─────────────────────────────────────────────────────────
function TodaySalesTab({ sale, items, isClosed, onRefresh }) {
  const [drugs, setDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch drugs for dropdown
  useEffect(() => {
    api.get("/pharmacy/drugs").then((res) => {
      setDrugs(res.data.drugs || []);
    });
  }, []);

  // Filter drugs as user types
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDrugs([]);
      setShowDropdown(false);
      return;
    }
    const filtered = drugs.filter((d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDrugs(filtered);
    setShowDropdown(true);
  }, [searchTerm, drugs]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !searchRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectDrug = (drug) => {
    setSelectedDrug(drug);
    setSearchTerm(drug.name);
    setShowDropdown(false);
    setQuantity(1);
  };

  const handleAddItem = async () => {
    if (!selectedDrug) return toast.error("Please select a drug.");
    setAdding(true);
    try {
      await api.post("/pharmacy/sales/items", {
        drug_id: selectedDrug.id,
        quantity: quantity,
      });
      toast.success(`${selectedDrug.name} added.`);
      setSelectedDrug(null);
      setSearchTerm("");
      setQuantity(1);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add item.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/pharmacy/sales/items/${itemId}`);
      toast.success("Item removed.");
      onRefresh();
    } catch {
      toast.error("Failed to remove item.");
    }
  };

  const handleUpdateQty = async (item, newQty) => {
    if (newQty < 1) return;
    try {
      await api.patch(`/pharmacy/sales/items/${item.id}`, { quantity: newQty });
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update quantity.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Closed banner */}
      {isClosed && (
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-5 py-4">
          <Lock size={18} className="text-slate-500" />
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              Today's sale is closed
            </p>
            <p className="text-xs text-slate-400">
              Closed at{" "}
              {sale?.closed_at
                ? new Date(sale.closed_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                  })
                : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Total card */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-teal-500/20">
        <p className="text-teal-100 text-sm font-medium mb-1">
          Today's Total Sales
        </p>
        <h3 className="text-4xl font-black">{formatNGN(sale?.total_amount)}</h3>
        <p className="text-teal-100 text-xs mt-2">
          {items.length} item{items.length !== 1 ? "s" : ""} sold today
        </p>
      </div>

      {/* Add drug section — only if open */}
      {!isClosed && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Add Drug to Sale
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Searchable drug dropdown */}
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
              <input
                ref={searchRef}
                type="text"
                placeholder="Type drug name to search..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedDrug(null);
                }}
                onFocus={() => searchTerm && setShowDropdown(true)}
              />

              {/* Dropdown results */}
              {showDropdown && filteredDrugs.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto"
                >
                  {filteredDrugs.map((drug) => (
                    <button
                      key={drug.id}
                      onClick={() => handleSelectDrug(drug)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-colors text-left cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {drug.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {drug.unit_type} · Stock: {drug.stock_quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-teal-600 dark:text-teal-400 flex-shrink-0 ml-4">
                        {formatNGN(drug.unit_price)}
                      </p>
                    </button>
                  ))}

                  {filteredDrugs.length === 0 && searchTerm && (
                    <div className="px-4 py-3 text-sm text-slate-400 italic">
                      No drugs found for "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-bold text-slate-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Price preview */}
            {selectedDrug && (
              <div className="flex items-center px-4 py-3 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 rounded-2xl flex-shrink-0">
                <p className="text-sm font-black text-teal-600 dark:text-teal-400">
                  {formatNGN(selectedDrug.unit_price * quantity)}
                </p>
              </div>
            )}

            {/* Add button */}
            <button
              onClick={handleAddItem}
              disabled={!selectedDrug || adding}
              className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              {adding ? "Adding..." : "Add"}
            </button>
          </div>

          {/* Stock warning */}
          {selectedDrug &&
            selectedDrug.stock_quantity <= selectedDrug.low_stock_threshold && (
              <div className="flex items-center gap-2 mt-3 text-amber-600 dark:text-amber-400 text-xs">
                <AlertTriangle size={13} />
                Only {selectedDrug.stock_quantity} unit(s) left in stock
              </div>
            )}
        </div>
      )}

      {/* Sales table */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart
              size={28}
              className="text-slate-300 dark:text-slate-600"
            />
          </div>
          <p className="text-slate-500 font-medium">
            No sales recorded yet today
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Search for a drug above to add it to today's sale.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {[
                  "Drug",
                  "Unit Price",
                  "Quantity",
                  "Total",
                  ...(isClosed ? [] : [""]),
                ].map((h, i) => (
                  <th
                    key={i}
                    className="p-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  {/* Drug */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Pill size={15} className="text-teal-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.drug_name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.drug?.unit_type}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Unit price */}
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {formatNGN(item.unit_price)}
                  </td>

                  {/* Quantity */}
                  <td className="p-4">
                    {isClosed ? (
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleUpdateQty(item, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-bold text-slate-900 dark:text-white text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQty(item, item.quantity + 1)
                          }
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Total */}
                  <td className="p-4 font-black text-slate-900 dark:text-white">
                    {formatNGN(item.total_price)}
                  </td>

                  {/* Remove button — only if open */}
                  {!isClosed && (
                    <td className="p-4">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>

            {/* Total footer */}
            <tfoot className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <td
                  colSpan={isClosed ? 3 : 3}
                  className="p-4 font-black text-slate-900 dark:text-white uppercase tracking-wide"
                >
                  Total
                </td>
                <td
                  colSpan={2}
                  className="p-4 font-black text-2xl text-teal-600 dark:text-teal-400"
                >
                  {formatNGN(sale?.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ── HISTORY TAB ───────────────────────────────────────────────────────────────
function HistoryTab({ history, onView }) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <TrendingUp
          size={36}
          className="text-slate-300 dark:text-slate-600 mb-4"
        />
        <p className="text-slate-500 font-medium">No sales history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((sale) => (
        <div
          key={sale.id}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-teal-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {new Date(sale.sale_date).toLocaleDateString("en-NG", {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span>{sale.items?.length || 0} items</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    Closed{" "}
                    {sale.closed_at
                      ? new Date(sale.closed_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "UTC",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {formatNGN(sale.total_amount)}
              </p>
              <button
                onClick={() => onView(sale.id)}
                className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-2xl text-sm font-bold transition-colors cursor-pointer"
              >
                View <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── HISTORY DETAIL VIEW ───────────────────────────────────────────────────────
function HistoryDetail({ saleId, onBack }) {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/pharmacy/sales/history/${saleId}`)
      .then((res) => setSale(res.data))
      .catch(() => toast.error("Failed to load sale details."))
      .finally(() => setLoading(false));
  }, [saleId]);

  if (loading)
    return <div className="p-6 text-slate-400 animate-pulse">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors text-sm font-medium mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to History
      </button>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Daily Sales Record
              </p>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {new Date(sale?.sale_date).toLocaleDateString("en-NG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Processed by {sale?.receptionist?.name} · Closed{" "}
                {sale?.closed_at
                  ? new Date(sale.closed_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "UTC",
                    })
                  : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Total</p>
              <p className="text-2xl font-black text-teal-600 dark:text-teal-400">
                {formatNGN(sale?.total_amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 dark:border-slate-700">
            <tr>
              {["Drug", "Unit Price", "Qty", "Total"].map((h) => (
                <th
                  key={h}
                  className="p-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {sale?.items?.map((item) => (
              <tr key={item.id}>
                <td className="p-4">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.drug_name}
                  </p>
                </td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                  {formatNGN(item.unit_price)}
                </td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">
                  {item.quantity}
                </td>
                <td className="p-4 font-black text-slate-900 dark:text-white">
                  {formatNGN(item.total_price)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <td
                colSpan={3}
                className="p-4 font-black text-slate-900 dark:text-white uppercase text-sm"
              >
                Total
              </td>
              <td className="p-4 font-black text-xl text-teal-600 dark:text-teal-400">
                {formatNGN(sale?.total_amount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
