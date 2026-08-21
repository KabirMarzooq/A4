import React, { useState, useEffect, useRef } from "react";
import {
  Receipt,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Printer,
  Search,
  User,
  Banknote,
  Stethoscope,
  Calendar,
  Loader2,
  X,
  Landmark,
  MoreHorizontal,
  Wallet,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { usePaystackEnabled } from "../hooks/usePaystackEnabled";
import { isDoctorRecordAuthor } from "../utils/roleDisplay";
import { COMPANY_NAME, COMPANY_RC_NUMBER } from "../utils/companyInfo";

// Print templates build raw HTML strings from user/patient-entered data
// (names, descriptions), so this guards against that data breaking out of
// its tag context in the print window.
const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);

const formatNGN = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

const formatInvoiceType = (type) =>
  (type || "").replace(/_/g, " ");

const formatDate = (date, opts = {}) =>
  new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...opts,
  });

const loadPaystackScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("paystack-script")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v2/inline.js";
    script.onload = resolve;
    document.body.appendChild(script);
  });

export default function ReceptionBills() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [viewingReceiptId, setViewingReceiptId] = useState(null);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const paystackEnabled = usePaystackEnabled();

  // Admin-only: total revenue collected today across every treatment/invoice.
  // This page is also shared with receptionist/pharmacy (see App.jsx route
  // guard), so the widget stays gated even though it lives here now.
  const currentUser = JSON.parse(localStorage.getItem("a4_user") || "null");
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";
  // Create Invoice is reception/admin only — pharmacy shares this page for
  // its own sales history but has its own sales desk, not this flow (see
  // routes/api.php's reception/bills POST route).
  const canCreateInvoice = ["admin", "receptionist"].includes(
    currentUser?.role?.toLowerCase()
  );
  const [revenueToday, setRevenueToday] = useState(null);

  const fetchBills = async (search = "") => {
    try {
      const res = await api.get("/reception/bills", {
        params: { search },
      });
      setData(res.data);
    } catch {
      toast.error("Failed to load bills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    loadPaystackScript();
    if (isAdmin) {
      api
        .get("/admin/revenue/today")
        .then((res) => setRevenueToday(res.data))
        .catch(() => {});
    }
    // isAdmin is derived from localStorage once and won't change for the
    // component's lifetime, matching the existing run-once-on-mount pattern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchBills(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading all bills...
      </div>
    );

  if (viewingReceiptId)
    return (
      <ReceiptView
        receiptId={viewingReceiptId}
        onBack={() => setViewingReceiptId(null)}
      />
    );

  if (viewingInvoice)
    return (
      <InvoiceView
        invoiceId={viewingInvoice}
        onBack={() => setViewingInvoice(null)}
        onPaid={() => {
          fetchBills(searchTerm);
          setViewingInvoice(null);
        }}
        paystackEnabled={paystackEnabled}
      />
    );

  const invoices = data?.invoices || [];
  const stats = data?.stats || {};

  const filtered = invoices.filter((i) => {
    const matchesStatus =
      filterStatus === "all" ? true : i.status === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchesDoctor = i.doctor?.name?.toLowerCase().includes(term);
    const matchesInvoice = i.invoice_number?.toLowerCase().includes(term);
    const matchesOnlinePatient = i.patient?.name?.toLowerCase().includes(term);
    const matchesPatient = i.patient_file?.first_name
      ?.toLowerCase()
      .includes(term);

    return (
      matchesStatus &&
      (matchesDoctor ||
        matchesInvoice ||
        matchesOnlinePatient ||
        matchesPatient)
    );
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Bills & Receipts
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage all patient billing and process payments
          </p>
        </div>
        {canCreateInvoice && (
          <button
            onClick={() => setIsCreateInvoiceOpen(true)}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Receipt size={18} /> Create Invoice
          </button>
        )}
      </div>

      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onCreated={() => {
          setIsCreateInvoiceOpen(false);
          fetchBills(searchTerm);
        }}
      />

      {isAdmin && revenueToday && (
        <div className="bg-gradient-to-br from-teal-600 to-teal-500 rounded-3xl p-6 shadow-lg shadow-teal-500/20 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mb-1">
                Total Revenue Today
              </p>
              <p className="text-3xl font-bold">
                {formatNGN(revenueToday.total_today)}
              </p>
              <p className="text-teal-100 text-xs mt-1">
                Across {revenueToday.invoice_count} paid invoice
                {revenueToday.invoice_count === 1 ? "" : "s"} — treatments &amp; bills
              </p>
            </div>
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
              <Wallet size={26} />
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Unpaid Bills"
          value={stats.unpaid_count || 0}
          sub={formatNGN(stats.total_unpaid || 0)}
          icon={<Clock size={20} />}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatCard
          label="Paid Bills"
          value={stats.paid_count || 0}
          sub={formatNGN(stats.total_paid || 0)}
          icon={<CheckCircle size={20} />}
          color="text-teal-500"
          bg="bg-teal-500/10"
        />
        <StatCard
          label="Total Outstanding"
          value={formatNGN(stats.total_unpaid || 0)}
          icon={<AlertCircle size={20} />}
          color="text-red-500"
          bg="bg-red-500/10"
        />
        <StatCard
          label="Total Collected"
          value={formatNGN(stats.total_paid || 0)}
          icon={<Banknote size={20} />}
          color="text-green-500"
          bg="bg-green-500/10"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by patient name or email..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "unpaid", "partially_paid", "overdue", "paid"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold capitalize transition-all cursor-pointer ${
                  filterStatus === status
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-300"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Receipt size={28} className="text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-slate-500 font-medium">No bills found</p>
          <p className="text-slate-400 text-sm mt-1">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : "No bills have been generated yet."}
          </p>
        </div>
      )}

      {/* Bills List */}
      <div className="space-y-3">
        {filtered.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            onView={() => setViewingInvoice(invoice.id)}
            onViewReceipt={() => setViewingReceiptId(invoice.receipt?.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── CREATE INVOICE ──────────────────────────────────────────────────────────
// Reuses the online/walk-in patient picker pattern from Prescriptions.jsx —
// a receptionist/admin bills a patient directly for something that isn't a
// visit record (doctors no longer generate invoices) or a lab order (still
// unpriced). Line items are free-form so it covers whatever the front desk
// is actually charging for.
const EMPTY_ITEM = { description: "", quantity: 1, unit_price: "" };

function CreateInvoiceModal({ isOpen, onClose, onCreated }) {
  const [patients, setPatients] = useState([]);
  const [patientFiles, setPatientFiles] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      api.get("/patients"),
      api.get("/folders", { params: { with_files: 1 } }),
    ])
      .then(([patientsRes, filesRes]) => {
        setPatients(patientsRes.data || []);
        const allFiles = (filesRes.data || []).flatMap((folder) =>
          (folder.files || []).map((file) => ({
            ...file,
            display: `${file.first_name} ${file.last_name} — ${folder.folder_name}`,
          }))
        );
        setPatientFiles(allFiles);
      })
      .catch(() => toast.error("Failed to load patients."));
  }, [isOpen]);

  const setItem = (index, field, value) =>
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const total = items.reduce(
    (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0),
    0
  );

  const reset = () => {
    setSelectedPatient("");
    setItems([{ ...EMPTY_ITEM }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return toast.error("Please select a patient.");
    if (
      items.some(
        (i) => !i.description.trim() || !i.quantity || i.unit_price === ""
      )
    )
      return toast.error("Please complete every line item.");

    const isFile = selectedPatient.startsWith("file-");
    const patientPayload = isFile
      ? { patient_file_id: selectedPatient.replace("file-", "") }
      : { patient_id: selectedPatient.replace("user-", "") };

    setSaving(true);
    try {
      await api.post("/reception/bills", {
        ...patientPayload,
        items: items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
        })),
      });
      toast.success("Invoice created.");
      reset();
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create invoice.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 transition-opacity duration-300">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 p-8 transform transition-transform duration-300 border-l border-slate-200 dark:border-slate-700 overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Invoice
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
              Patient
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="">Select a patient</option>
              {patients.length > 0 && (
                <optgroup label="── Online Patients ──">
                  {patients.map((p) => (
                    <option key={`user-${p.id}`} value={`user-${p.id}`}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {patientFiles.length > 0 && (
                <optgroup label="── Walk-in Patients ──">
                  {patientFiles.map((f) => (
                    <option key={`file-${f.id}`} value={`file-${f.id}`}>
                      {f.display}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">
              Line Items
            </label>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="e.g. Ward fee, wound dressing..."
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      value={item.description}
                      onChange={(e) =>
                        setItem(index, "description", e.target.value)
                      }
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 font-bold uppercase mb-1">
                        Qty
                      </p>
                      <input
                        type="number"
                        min="1"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                        value={item.quantity}
                        onChange={(e) =>
                          setItem(index, "quantity", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase mb-1">
                        Unit Price
                      </p>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                        value={item.unit_price}
                        onChange={(e) =>
                          setItem(index, "unit_price", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase mb-1">
                        Total
                      </p>
                      <p className="p-2.5 bg-teal-50 dark:bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400 font-bold">
                        {formatNGN(
                          (Number(item.quantity) || 0) *
                            (Number(item.unit_price) || 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-3 text-teal-600 dark:text-teal-400 text-sm font-bold hover:underline cursor-pointer"
            >
              + Add another item
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500 uppercase">
              Total
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {formatNGN(total)}
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/25 cursor-pointer"
          >
            {saving ? "Creating..." : "Create Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InvoiceCard({ invoice, onView, onViewReceipt }) {
  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.status === "overdue";
  const isPartial = invoice.status === "partially_paid";
  const balance = Number(invoice.total_amount) - Number(invoice.amount_paid || 0);

  return (
    <div
      className={`bg-white dark:bg-slate-800 border rounded-3xl p-5 hover:shadow-md transition-all ${
        isOverdue
          ? "border-red-300 dark:border-red-500/40"
          : isPaid
          ? "border-slate-200 dark:border-slate-700"
          : "border-amber-300 dark:border-amber-500/40"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-white text-lg uppercase ${
              isPaid ? "bg-teal-500" : "bg-amber-500"
            }`}
          >
            {(
              invoice?.patient?.name ||
              invoice?.patient_file?.first_name ||
              invoice.folder?.folder_name ||
              "P"
            ).charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <p className="font-bold text-slate-900 dark:text-white">
                {invoice.patient?.name ||
                  (invoice.patient_file
                    ? `${invoice.patient_file.first_name} ${invoice.patient_file.last_name}`
                    : null) ||
                  invoice.folder?.folder_name ||
                  "Reception"}
              </p>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-slate-400 mb-1">
              {invoice.patient?.email}
            </p>
            <div className="flex flex-wrap gap-x-4 text-xs text-slate-500">
              <span className="font-mono font-bold">
                {invoice.invoice_number}
              </span>
              <span className="capitalize">
                {formatInvoiceType(invoice.type)}
              </span>
              <span>
                {invoice.doctor
                  ? `${
                      isDoctorRecordAuthor(invoice.doctor) ? "Dr. " : ""
                    }${invoice.doctor.name}`
                  : invoice.folder
                  ? "Registration"
                  : "—"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {isPaid
                  ? `Paid: ${formatDate(invoice.paid_at)}`
                  : `Due: ${
                      invoice.due_date ? formatDate(invoice.due_date) : "—"
                    }`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {formatNGN(isPartial ? balance : invoice.total_amount)}
            </p>
            {isPartial && (
              <p className="text-[10px] text-blue-500 font-bold">
                Balance of {formatNGN(invoice.total_amount)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onView}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm transition-all cursor-pointer"
            >
              View <ChevronRight size={14} />
            </button>
            {isPaid && invoice.receipt && (
              <button
                onClick={onViewReceipt}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                <Receipt size={14} /> Receipt
              </button>
            )}
            {!isPaid && (
              <button
                onClick={onView}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-95 cursor-pointer"
              >
                <CreditCard size={14} /> Pay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceView({ invoiceId, onBack, onPaid, paystackEnabled }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState(null); // 'manual' | 'card' | null
  const [selectedMethod, setSelectedMethod] = useState("cash"); // cash | pos | transfer | other
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const PAYMENT_METHODS = [
    { value: "cash", label: "Cash", icon: Banknote },
    { value: "pos", label: "POS", icon: CreditCard },
    { value: "transfer", label: "Bank Transfer", icon: Landmark },
    { value: "other", label: "Other", icon: MoreHorizontal },
  ];

  useEffect(() => {
    api
      .get(`/reception/bills/${invoiceId}`)
      .then((res) => {
        setInvoice(res.data);
        const balance =
          Number(res.data.total_amount) - Number(res.data.amount_paid || 0);
        setPaymentAmount(balance > 0 ? balance.toFixed(2) : "");
      })
      .catch(() => toast.error("Failed to load invoice."))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const balance = invoice
    ? Number(invoice.total_amount) - Number(invoice.amount_paid || 0)
    : 0;

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter an amount to collect.");
      return;
    }
    if (amount > balance + 0.01) {
      toast.error(`Amount can't exceed the balance of ${formatNGN(balance)}.`);
      return;
    }
    setPaying(true);
    try {
      await api.post(`/reception/bills/${invoiceId}/cash-payment`, {
        payment_method: selectedMethod,
        amount,
        notes: paymentNotes,
      });
      toast.success(
        amount < balance - 0.01
          ? `Partial payment of ${formatNGN(amount)} recorded.`
          : "Payment recorded! Receipt generated."
      );
      onPaid();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setPaying(false);
    }
  };

  // Card payment via Paystack popup — always charges the full outstanding
  // balance (Paystack has no concept of a partial card payment; the backend
  // already computes this same amount server-side when initializing).
  const handleCardPay = async () => {
    setPaying(true);
    try {
      const res = await api.post("/reception/payment/initialize", {
        invoice_id: invoiceId,
      });

      const { access_code, reference } = res.data;
      await loadPaystackScript();

      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        amount: Math.round(balance * 100),
        currency: "NGN",
        ref: reference,
        accessCode: access_code,

        onSuccess: async (transaction) => {
          try {
            const verify = await api.get(
              `/patient/payment/verify/${transaction.reference}`
            );
            if (verify.data.verified) {
              toast.success("Card payment successful! Receipt generated.");
              onPaid();
            } else {
              toast.error("Payment could not be verified.");
            }
          } catch {
            toast.success("Payment received! Refreshing...");
            onPaid();
          }
        },
        onLoad: () => setPaying(false),
        onCancel: () => {
          setPaying(false);
          setPayMethod(null);
          toast("Payment cancelled.", { icon: "ℹ️" });
        },
      });

      handler.openIframe();
    } catch (err) {
      setPaying(false);
      toast.error(
        err.response?.data?.message || "Could not initialize payment."
      );
    }
  };

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">Loading invoice...</div>
    );

  const isPaid = invoice?.status === "paid";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors text-sm font-medium mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Bills
      </button>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Invoice
              </p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {invoice?.invoice_number}
              </h2>
            </div>
            <StatusBadge status={invoice?.status} large />
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center font-bold text-white text-lg uppercase flex-shrink-0">
              {(
                invoice?.patient?.name ||
                invoice?.patient_file?.first_name ||
                invoice.folder?.folder_name ||
                "P"
              ).charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {invoice?.patient?.name ||
                  (invoice.patient_file
                    ? `${invoice.patient_file.first_name} ${invoice.patient_file.last_name}`
                    : null) ||
                  invoice.folder?.folder_name ||
                  "Reception"}
              </p>
              <p className="text-xs text-slate-400">
                {invoice?.patient?.email ||
                  invoice?.patient_file?.folder?.phone ||
                  invoice.folder?.phone ||
                  "—"}
              </p>
              {invoice?.patient_file?.folder && (
                <p className="text-xs text-slate-400">
                  {invoice.patient_file.folder.folder_name}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailChip
              icon={<Stethoscope size={14} />}
              label="Issued By"
              value={
                invoice.doctor
                  ? `${
                      isDoctorRecordAuthor(invoice.doctor) ? "Dr. " : ""
                    }${invoice.doctor.name}`
                  : invoice.folder
                  ? "New Patient Registration"
                  : invoice.type === "reception_bill"
                  ? "Front Desk"
                  : "—"
              }
            />
            {invoice?.doctor?.specialization && (
              <DetailChip
                icon={<User size={14} />}
                label="Specialization"
                value={invoice.doctor.specialization}
              />
            )}
            {invoice?.appointment && (
              <DetailChip
                icon={<Calendar size={14} />}
                label="Appointment Date"
                value={formatDate(invoice.appointment.appointment_date)}
              />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Bill Breakdown
            </p>
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-center p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="text-right p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {invoice?.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                        {item.description}
                      </td>
                      <td className="p-4 text-center text-slate-500">
                        {item.quantity}
                      </td>
                      <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatNGN(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-900/50 border-t-2 border-slate-200 dark:border-slate-700">
                  {invoice?.status === "partially_paid" && (
                    <tr>
                      <td
                        colSpan={2}
                        className="p-4 pb-1 font-bold text-slate-500 dark:text-slate-400 text-sm"
                      >
                        Paid so far
                      </td>
                      <td className="p-4 pb-1 text-right font-bold text-blue-600 dark:text-blue-400">
                        {formatNGN(invoice.amount_paid)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      colSpan={2}
                      className="p-4 font-black text-slate-900 dark:text-white uppercase text-sm"
                    >
                      {invoice?.status === "partially_paid"
                        ? "Balance Remaining"
                        : "Total Due"}
                    </td>
                    <td className="p-4 text-right font-black text-xl text-teal-600 dark:text-teal-400">
                      {formatNGN(
                        invoice?.status === "partially_paid"
                          ? balance
                          : invoice?.total_amount
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          {isPaid && (
            <div className="flex items-start gap-3 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 rounded-2xl p-4">
              <CheckCircle
                size={16}
                className="text-teal-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-teal-600 dark:text-teal-400">
                Payment received on{" "}
                <span className="font-bold">{formatDate(invoice.paid_at)}</span>
                . Receipt{" "}
                <span className="font-bold font-mono">
                  {invoice.receipt?.receipt_number}
                </span>{" "}
                has been issued.
              </p>
            </div>
          )}
          {!isPaid && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Process Payment
              </p>

              {/* Method selector */}
              {!payMethod && (
                <div
                  className={`grid gap-3 ${
                    paystackEnabled ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  <button
                    onClick={() => setPayMethod("manual")}
                    className="flex flex-col items-center gap-2 p-5 bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/30 hover:border-green-400 dark:hover:border-green-500 rounded-2xl transition-all group cursor-pointer"
                  >
                    <Banknote
                      size={28}
                      className="text-green-600 dark:text-green-400"
                    />
                    <span className="font-bold text-green-700 dark:text-green-400 text-sm">
                      Record Payment
                    </span>
                    <span className="text-xs text-green-600/70 dark:text-green-500/70 text-center">
                      Cash, POS, transfer — paid at the desk
                    </span>
                  </button>

                  {paystackEnabled && (
                    <button
                      onClick={() => setPayMethod("card")}
                      className="flex flex-col items-center gap-2 p-5 bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl transition-all group cursor-pointer"
                    >
                      <CreditCard
                        size={28}
                        className="text-blue-600 dark:text-blue-400"
                      />
                      <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">
                        Card Payment
                      </span>
                      <span className="text-xs text-blue-600/70 dark:text-blue-500/70 text-center">
                        Process via Paystack
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Manual payment form (cash / POS / transfer / other) */}
              {payMethod === "manual" && (
                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                      <Banknote size={16} /> Record Payment
                    </p>
                    <button
                      onClick={() => setPayMethod(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-green-100 dark:border-green-500/20">
                    <label className="text-xs text-slate-400 mb-2 block text-center">
                      Amount to collect — balance is {formatNGN(balance)}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-400 font-bold">
                        ₦
                      </span>
                      <input
                        type="number"
                        min="0.01"
                        max={balance}
                        step="0.01"
                        className="w-full text-center text-2xl font-black text-green-600 dark:text-green-400 bg-transparent outline-none pl-8 py-1"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    {parseFloat(paymentAmount) > 0 &&
                      parseFloat(paymentAmount) < balance - 0.01 && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-1 font-semibold">
                          Partial payment — {formatNGN(balance - parseFloat(paymentAmount))}{" "}
                          will remain owing.
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      How was it paid?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                        <label
                          key={value}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedMethod === value
                              ? "border-green-500 bg-green-100 dark:bg-green-500/20"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-green-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment_method"
                            value={value}
                            checked={selectedMethod === value}
                            onChange={() => setSelectedMethod(value)}
                            className="sr-only"
                          />
                          <Icon
                            size={16}
                            className="text-green-600 dark:text-green-400 flex-shrink-0"
                          />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Paid in full, change given..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-green-400 text-sm"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleRecordPayment}
                    disabled={paying}
                    className="w-full py-3.5 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-black rounded-2xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {paying ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />{" "}
                        Processing...
                      </>
                    ) : (
                      <>
                        <Banknote size={18} /> Confirm Payment
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Card payment */}
              {payMethod === "card" && (
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                      <CreditCard size={16} /> Card Payment
                    </p>
                    <button
                      onClick={() => setPayMethod(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    The Paystack payment popup will open. Ask the patient to
                    enter their card details or enter them on their behalf.
                  </p>

                  <button
                    onClick={handleCardPay}
                    disabled={paying}
                    className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {paying ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Opening
                        payment...
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} /> Open Paystack —{" "}
                        {formatNGN(balance)}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    🔒 Secured by Paystack
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReceiptView({ receiptId, onBack }) {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    api
      .get(`/reception/receipts/${receiptId}`)
      .then((res) => setReceipt(res.data))
      .catch(() => toast.error("Failed to load receipt."))
      .finally(() => setLoading(false));
  }, [receiptId]);

  // Builds a fully self-contained, inline-styled document rather than
  // reusing the on-screen Tailwind markup — the print window never loads
  // Tailwind, so copying that innerHTML across previously produced an
  // unstyled "raw form" (this was the actual bug behind that complaint).
  // Sized to a quarter of A4 (~A6) per the hospital's request, so it prints
  // or saves-as-PDF standalone at that fixed size regardless of the app's
  // own page size.
  const handlePrint = () => {
    const invoice = receipt?.invoice;
    const patientName =
      invoice?.patient?.name ||
      (invoice?.patient_file
        ? `${invoice.patient_file.first_name} ${invoice.patient_file.last_name}`
        : invoice?.folder?.folder_name || "Walk-in Patient");
    const patientContact =
      invoice?.patient?.email ||
      invoice?.patient_file?.folder?.phone ||
      invoice?.folder?.phone ||
      "—";

    const itemRows = (invoice?.items || [])
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.description)}</td>
            <td class="amt">${escapeHtml(formatNGN(item.total_price))}</td>
          </tr>`
      )
      .join("");

    const html = `
      <!DOCTYPE html><html><head>
      <meta charset="utf-8" />
      <title>Receipt ${escapeHtml(receipt?.receipt_number || "")}</title>
      <style>
        @page { size: 105mm 148mm; margin: 6mm; }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',Arial,sans-serif; color:#1e293b; font-size:9px; }
        .sheet { border:2px solid #0f766e; border-radius:6px; padding:10px; position:relative; overflow:hidden; }
        .sheet::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          border:1px solid #99f6e4; border-radius:4px; margin:3px;
        }
        .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #14b8a6; padding-bottom:6px; margin-bottom:8px; }
        .brand { font-size:14px; font-weight:900; color:#0f766e; letter-spacing:-0.3px; }
        .brand-sub { font-size:7px; color:#64748b; margin-top:1px; }
        .rc { font-size:6.5px; color:#94a3b8; margin-top:2px; }
        .badge { background:#f0fdfa; border:1px solid #5eead4; color:#0f766e; font-size:6.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; padding:3px 6px; border-radius:999px; white-space:nowrap; }
        .patient { background:#f8fafc; border-radius:6px; padding:6px 8px; margin-bottom:8px; }
        .patient-name { font-weight:800; font-size:9.5px; }
        .patient-contact { font-size:7.5px; color:#94a3b8; }
        .amount-box { background:#f0fdf4; border:1.5px solid #86efac; border-radius:6px; padding:8px; text-align:center; margin-bottom:8px; }
        .amount-label { font-size:6.5px; text-transform:uppercase; letter-spacing:0.8px; color:#15803d; font-weight:800; }
        .amount-value { font-size:17px; font-weight:900; color:#15803d; }
        .meta { display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-bottom:8px; font-size:7.5px; }
        .meta-item { background:#f8fafc; border-radius:5px; padding:5px 6px; }
        .meta-label { font-size:6px; text-transform:uppercase; letter-spacing:0.5px; color:#94a3b8; font-weight:700; }
        .meta-value { font-weight:700; margin-top:1px; }
        table { width:100%; border-collapse:collapse; margin-bottom:6px; font-size:7.5px; }
        th { text-align:left; font-size:6px; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; border-bottom:1px solid #cbd5e1; padding:3px 0; }
        td { padding:3px 0; border-bottom:1px solid #e2e8f0; }
        .amt { text-align:right; font-weight:700; }
        .total-row td { font-weight:900; font-size:9px; color:#0f766e; border:none; border-top:2px solid #0f766e; padding-top:5px; }
        .footer { margin-top:8px; padding-top:6px; border-top:1px dashed #cbd5e1; font-size:6px; color:#94a3b8; text-align:center; line-height:1.5; }
      </style>
      </head><body>
        <div class="sheet">
          <div class="header">
            <div>
              <div class="brand">${escapeHtml(COMPANY_NAME)}</div>
              <div class="brand-sub">Hospital Management System</div>
              <div class="rc">${escapeHtml(COMPANY_RC_NUMBER)}</div>
            </div>
            <span class="badge">Official Receipt</span>
          </div>

          <div class="patient">
            <div class="patient-name">${escapeHtml(patientName)}</div>
            <div class="patient-contact">${escapeHtml(patientContact)}</div>
          </div>

          <div class="amount-box">
            <div class="amount-label">Payment Successful</div>
            <div class="amount-value">${escapeHtml(formatNGN(receipt?.amount_paid))}</div>
          </div>

          <div class="meta">
            <div class="meta-item">
              <div class="meta-label">Receipt No.</div>
              <div class="meta-value">${escapeHtml(receipt?.receipt_number || "—")}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Invoice No.</div>
              <div class="meta-value">${escapeHtml(invoice?.invoice_number || "—")}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Payment Date</div>
              <div class="meta-value">${escapeHtml(formatDate(receipt?.issued_at))}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Method</div>
              <div class="meta-value">${escapeHtml((receipt?.payment_method || "—").toUpperCase())}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr><th>Description</th><th class="amt">Amount</th></tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr class="total-row">
                <td>Total Paid</td>
                <td class="amt">${escapeHtml(formatNGN(receipt?.amount_paid))}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            This is an official receipt from ${escapeHtml(COMPANY_NAME)} HMS.<br />
            ${escapeHtml(COMPANY_RC_NUMBER)} · Generated on ${escapeHtml(formatDate(new Date()))}
          </div>
        </div>
      </body></html>
    `;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">Loading receipt...</div>
    );

  const invoice = receipt?.invoice;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors text-sm font-medium cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Bills
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Printer size={16} /> Print Receipt
        </button>
      </div>

      <div
        ref={printRef}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm"
      >
        <div className="flex justify-between items-center border-b-2 border-teal-500 p-6">
          <div>
            <h1 className="text-2xl font-black text-teal-700 dark:text-teal-400">
              A4 Medical
            </h1>
            <p className="text-xs text-slate-400">Hospital Management System</p>
            <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
              {COMPANY_RC_NUMBER}
            </p>
          </div>
          <span className="bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
            Official Receipt
          </span>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center font-bold text-white uppercase">
              {(
                invoice?.patient?.name ||
                invoice?.patient_file?.first_name ||
                invoice?.folder?.folder_name ||
                "P"
              ).charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {invoice?.patient?.name ||
                  (invoice.patient_file
                    ? `${invoice.patient_file.first_name} ${invoice.patient_file.last_name}`
                    : invoice?.folder?.folder_name || "Walk-in Patient")}
              </p>
              <p className="text-xs text-slate-400">
                {invoice?.patient?.email ||
                  invoice?.patient_file?.folder?.phone ||
                  invoice?.folder?.phone ||
                  "—"}
              </p>
              {(invoice?.patient_file?.folder?.folder_name ||
                invoice?.folder?.folder_name) && (
                <p className="text-xs text-slate-400">
                  {invoice?.patient_file?.folder?.folder_name ||
                    invoice?.folder?.folder_name}
                </p>
              )}
            </div>
          </div>

          <div className="bg-teal-50 dark:bg-teal-500/10 border-2 border-teal-200 dark:border-teal-500/30 rounded-2xl p-5 text-center">
            <CheckCircle size={32} className="text-teal-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">
              Payment Successful
            </p>
            <p className="text-3xl font-black text-teal-700 dark:text-teal-400">
              {formatNGN(receipt?.amount_paid)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailChip
              label="Receipt No."
              value={receipt?.receipt_number}
              mono
            />
            <DetailChip
              label="Invoice No."
              value={invoice?.invoice_number}
              mono
            />
            <DetailChip
              label="Payment Date"
              value={formatDate(receipt?.issued_at)}
            />
            <DetailChip
              label="Payment Method"
              value={receipt?.payment_method?.toUpperCase() || "—"}
            />
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase">
                    Description
                  </th>
                  <th className="text-right p-4 text-xs font-bold text-slate-400 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {invoice?.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      {item.description}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatNGN(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <td className="p-4 font-black text-slate-900 dark:text-white uppercase text-sm">
                    Total Paid
                  </td>
                  <td className="p-4 text-right font-black text-xl text-teal-600 dark:text-teal-400">
                    {formatNGN(receipt?.amount_paid)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 text-center">
            <p className="text-xs text-slate-400">
              This is an official receipt from {COMPANY_NAME} HMS.
            </p>
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
              {COMPANY_RC_NUMBER} · Generated on {formatDate(new Date())}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatusBadge = ({ status, large = false }) => {
  const styles = {
    unpaid:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    partially_paid:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    overdue:
      "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30",
    paid: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 border-teal-200 dark:border-teal-500/30",
    cancelled:
      "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-600",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full font-bold uppercase tracking-widest border ${
        styles[status] || styles.unpaid
      } ${large ? "text-xs" : "text-[10px]"}`}
    >
      {status?.replace("_", " ")}
    </span>
  );
};

const DetailChip = ({ icon, label, value, mono = false }) => (
  <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-100 dark:border-slate-700">
    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
      {icon} {label}
    </div>
    <p
      className={`text-sm font-bold text-slate-800 dark:text-white ${
        mono ? "font-mono" : ""
      }`}
    >
      {value || "—"}
    </p>
  </div>
);

const StatCard = ({ label, value, sub, icon, color, bg }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
    <div
      className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center flex-shrink-0`}
    >
      {icon}
    </div>
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
        {label}
      </p>
      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
        {value}
      </h4>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  </div>
);
