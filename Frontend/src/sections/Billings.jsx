import React, { useState, useEffect, useRef } from "react";
import {
  Receipt,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  X,
  Printer,
  ArrowLeft,
  Stethoscope,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { usePaystackEnabled } from "../hooks/usePaystackEnabled";
import { COMPANY_NAME, COMPANY_RC_NUMBER } from "../utils/companyInfo";
import { isDoctorRecordAuthor } from "../utils/roleDisplay";

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

export default function BillsReceipts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [viewingReceiptId, setViewingReceiptId] = useState(null);
  const paystackEnabled = usePaystackEnabled();

  const fetchBills = async () => {
    try {
      const res = await api.get("/patient/bills");
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

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading your bills...
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
          fetchBills();
          setViewingInvoice(null);
        }}
        paystackEnabled={paystackEnabled}
      />
    );

  const invoices = data?.invoices || [];
  const unpaid = invoices.filter((i) =>
    ["unpaid", "overdue"].includes(i.status)
  );
  const paid = invoices.filter((i) => i.status === "paid");

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Bills & Receipts
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage your hospital bills and download receipts
        </p>
      </div>

      {data?.unpaid_count > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl p-6 mb-8 text-white shadow-lg shadow-red-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-red-100 text-sm font-medium mb-1">
                Outstanding Balance
              </p>
              <h3 className="text-3xl font-black">
                {formatNGN(data.total_outstanding)}
              </h3>
              <p className="text-red-100 text-sm mt-1">
                {data.unpaid_count} unpaid{" "}
                {data.unpaid_count === 1 ? "bill" : "bills"} pending
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-2xl px-5 py-3">
              <AlertCircle size={18} />
              <span className="font-bold text-sm">Action Required</span>
            </div>
          </div>
        </div>
      )}

      {invoices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5">
            <Receipt size={36} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-slate-700 dark:text-slate-300 font-bold text-lg mb-2">
            No Bills Yet
          </h3>
          <p className="text-slate-400 text-sm max-w-sm">
            Bills will appear here once your doctor confirms an appointment.
          </p>
        </div>
      )}

      {unpaid.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            Unpaid Bills ({unpaid.length})
          </h3>
          <div className="space-y-3">
            {unpaid.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onView={() => setViewingInvoice(invoice.id)}
                paystackEnabled={paystackEnabled}
              />
            ))}
          </div>
        </div>
      )}

      {paid.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full" />
            Payment History ({paid.length})
          </h3>
          <div className="space-y-3">
            {paid.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onView={() => setViewingInvoice(invoice.id)}
                onViewReceipt={() => setViewingReceiptId(invoice.receipt?.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceCard({ invoice, onView, onViewReceipt, paystackEnabled }) {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isPaid
                ? "bg-teal-500/10 text-teal-600"
                : "bg-amber-500/10 text-amber-600"
            }`}
          >
            {isPaid ? <CheckCircle size={22} /> : <CreditCard size={22} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-black text-slate-900 dark:text-white font-mono text-sm">
                {invoice.invoice_number}
              </p>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 capitalize mb-1">
              {invoice.type} — Dr. {invoice.doctor?.name}
            </p>
            <div className="flex flex-wrap gap-x-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
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
            {!isPaid && paystackEnabled && (
              <button
                onClick={onView}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-95 cursor-pointer"
              >
                <CreditCard size={14} /> Pay Now
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

  useEffect(() => {
    api
      .get(`/patient/bills/${invoiceId}`)
      .then((res) => setInvoice(res.data))
      .catch(() => toast.error("Failed to load invoice."))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handlePayNow = async () => {
    setPaying(true);
    try {
      // Ask backend to initialize the transaction with Paystack
      const res = await api.post("/patient/payment/initialize", {
        invoice_id: invoiceId,
      });

      const { access_code, reference } = res.data;

      // Open Paystack inline popup
      await loadPaystackScript();

      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: invoice?.patient?.email,
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
              toast.success("Payment successful! Your receipt is ready.");
              onPaid();
            } else {
              toast.error("Payment could not be verified. Contact support.");
            }
          } catch {
            toast.success("Payment received! Refreshing...");
            onPaid();
          }
        },

        onLoad: () => {
          setPaying(false);
        },

        onCancel: () => {
          setPaying(false);
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
          <div className="grid grid-cols-2 gap-4">
            <DetailChip
              icon={<Stethoscope size={14} />}
              label="Issued By"
              value={
                invoice?.doctor
                  ? `${
                      isDoctorRecordAuthor(invoice.doctor) ? "Dr. " : ""
                    }${invoice.doctor.name}`
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
              <>
                <DetailChip
                  icon={<Calendar size={14} />}
                  label="Appointment Date"
                  value={formatDate(invoice.appointment.appointment_date)}
                />
                <DetailChip
                  icon={<Clock size={14} />}
                  label="Appointment Time"
                  value={invoice.appointment.appointment_time}
                />
              </>
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
                      className="p-4 font-black text-slate-900 dark:text-white uppercase tracking-wide text-sm"
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

          {!isPaid && invoice?.due_date && (
            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4">
              <AlertCircle
                size={16}
                className="text-amber-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Payment is due by{" "}
                <span className="font-bold">
                  {formatDate(invoice.due_date, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                . Your appointment may be cancelled if payment is not received.
              </p>
            </div>
          )}

          {isPaid && invoice?.receipt && (
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
                  {invoice.receipt.receipt_number}
                </span>{" "}
                has been issued.
              </p>
            </div>
          )}

          {!isPaid && paystackEnabled && (
            <button
              onClick={handlePayNow}
              disabled={paying}
              className="w-full py-4 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-black text-lg rounded-2xl transition-all shadow-lg shadow-teal-500/25 active:scale-95 flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
            >
              {paying ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Opening payment...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Pay {formatNGN(invoice?.total_amount)}
                </>
              )}
            </button>
          )}

          {!isPaid && paystackEnabled && (
            <p className="text-center text-xs text-slate-400">
              🔒 Secured by Paystack — Cards, Bank Transfer & USSD accepted
            </p>
          )}

          {!isPaid && !paystackEnabled && (
            <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
              <AlertCircle
                size={16}
                className="text-slate-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Online payment isn't available right now. Please pay at the
                hospital desk by cash, POS, or bank transfer — your invoice
                will be updated once payment is recorded.
              </p>
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
      .get(`/patient/receipts/${receiptId}`)
      .then((res) => setReceipt(res.data))
      .catch(() => toast.error("Failed to load receipt."))
      .finally(() => setLoading(false));
  }, [receiptId]);

  const handlePrint = () => {
    const invoice = receipt?.invoice;
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
              <div class="meta-label">Issued By</div>
              <div class="meta-value">${escapeHtml(
                invoice?.doctor
                  ? `${isDoctorRecordAuthor(invoice.doctor) ? "Dr. " : ""}${invoice.doctor.name}`
                  : "—"
              )}</div>
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
            Thank you for your payment. This is an official receipt from ${escapeHtml(COMPANY_NAME)} HMS.<br />
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
              value={receipt?.payment_method?.toUpperCase() || "CARD"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailChip
              icon={<Stethoscope size={13} />}
              label="Issued By"
              value={
                invoice?.doctor
                  ? `${
                      isDoctorRecordAuthor(invoice.doctor) ? "Dr. " : ""
                    }${invoice.doctor.name}`
                  : "—"
              }
            />
            {invoice?.appointment && (
              <DetailChip
                icon={<Calendar size={13} />}
                label="Appointment"
                value={formatDate(invoice.appointment.appointment_date)}
              />
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Items
            </p>
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-right p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
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
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 text-center">
            <p className="text-xs text-slate-400">
              Thank you for your payment. This is an official receipt from
              {" "}{COMPANY_NAME} HMS.
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
