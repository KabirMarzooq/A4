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
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { usePaystackEnabled } from "../hooks/usePaystackEnabled";

const formatNGN = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

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
  const paystackEnabled = usePaystackEnabled();

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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Bills & Receipts
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage all patient billing and process payments
        </p>
      </div>

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
          {["all", "unpaid", "overdue", "paid"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold capitalize transition-all cursor-pointer ${
                filterStatus === status
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-300"
              }`}
            >
              {status}
            </button>
          ))}
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

function InvoiceCard({ invoice, onView, onViewReceipt }) {
  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.status === "overdue";

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
              <span className="capitalize">{invoice.type}</span>
              <span>
                {invoice.doctor
                  ? `${
                      invoice.doctor.role?.toLowerCase() === "doctor"
                        ? "Dr. "
                        : ""
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
          <p className="text-xl font-black text-slate-900 dark:text-white">
            {formatNGN(invoice.total_amount)}
          </p>
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

  const PAYMENT_METHODS = [
    { value: "cash", label: "Cash", icon: Banknote },
    { value: "pos", label: "POS", icon: CreditCard },
    { value: "transfer", label: "Bank Transfer", icon: Landmark },
    { value: "other", label: "Other", icon: MoreHorizontal },
  ];

  useEffect(() => {
    api
      .get(`/reception/bills/${invoiceId}`)
      .then((res) => setInvoice(res.data))
      .catch(() => toast.error("Failed to load invoice."))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handleRecordPayment = async () => {
    setPaying(true);
    try {
      await api.post(`/reception/bills/${invoiceId}/cash-payment`, {
        payment_method: selectedMethod,
        notes: paymentNotes,
      });
      toast.success("Payment recorded! Receipt generated.");
      onPaid();
    } catch {
      toast.error("Failed to record payment.");
    } finally {
      setPaying(false);
    }
  };

  // Card payment via Paystack popup
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
        amount: Math.round(invoice?.total_amount * 100),
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
                      invoice.doctor.role?.toLowerCase() === "doctor"
                        ? "Dr. "
                        : ""
                    }${invoice.doctor.name}`
                  : invoice.folder
                  ? "New Patient Registration"
                  : "—"
              }
            />
            <DetailChip
              icon={<User size={14} />}
              label="Specialization"
              value={invoice?.doctor?.specialization || "—"}
            />
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
                  <tr>
                    <td
                      colSpan={2}
                      className="p-4 font-black text-slate-900 dark:text-white uppercase text-sm"
                    >
                      Total Due
                    </td>
                    <td className="p-4 text-right font-black text-xl text-teal-600 dark:text-teal-400">
                      {formatNGN(invoice?.total_amount)}
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

                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center border border-green-100 dark:border-green-500/20">
                    <p className="text-xs text-slate-400 mb-1">
                      Amount to collect
                    </p>
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">
                      {formatNGN(invoice?.total_amount)}
                    </p>
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
                        {formatNGN(invoice?.total_amount)}
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

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Receipt ${receipt?.receipt_number}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',Arial,sans-serif; color:#1e293b; padding:40px; font-size:13px; }
        .header { display:flex; justify-content:space-between; border-bottom:3px solid #14b8a6; padding-bottom:16px; margin-bottom:20px; }
        .brand { font-size:22px; font-weight:900; color:#0f766e; }
        .success-box { background:#f0fdf4; border:2px solid #86efac; border-radius:12px; padding:16px; text-align:center; margin:20px 0; }
        .success-amount { font-size:28px; font-weight:900; color:#15803d; }
        .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:16px 0; }
        .meta-item { background:#f8fafc; border-radius:8px; padding:10px; }
        .meta-label { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:700; }
        .meta-value { font-size:13px; font-weight:700; margin-top:2px; }
        table { width:100%; border-collapse:collapse; margin:12px 0; }
        th { background:#f8fafc; padding:10px; text-align:left; font-size:10px; text-transform:uppercase; color:#64748b; }
        td { padding:10px; border-bottom:1px solid #e2e8f0; }
        .total td { font-weight:900; font-size:15px; color:#0f766e; border:none; border-top:2px solid #e2e8f0; }
        .footer { margin-top:24px; padding-top:12px; border-top:1px solid #e2e8f0; font-size:10px; color:#94a3b8; text-align:center; }
        @media print { body { padding:20px; } }
      </style>
      </head><body>${content}</body></html>
    `);
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
              This is an official receipt from A4 Medical Consortium HMS.
            </p>
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
              Generated on {formatDate(new Date())}
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
      {status}
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
