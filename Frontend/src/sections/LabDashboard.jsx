import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  Search,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle,
  Upload,
  Send,
  X,
  FileText,
  Mail,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 text-sm";

const formatNGN = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount || 0);

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────
export default function LabDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  const fetchAll = async () => {
    try {
      const [pendingRes, historyRes] = await Promise.all([
        api.get("/lab-orders"),
        api.get("/lab-orders/history"),
      ]);
      setPending(pendingRes.data || []);
      setHistory(historyRes.data?.data || []);
    } catch {
      toast.error("Failed to load lab orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (selectedOrder) {
    return (
      <OrderDetail
        orderId={selectedOrder}
        onBack={() => {
          setSelectedOrder(null);
          fetchAll();
        }}
      />
    );
  }

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading lab dashboard...
      </div>
    );

  const list = activeTab === "pending" ? pending : history;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Lab Dashboard
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {pending.length} pending · {history.length} completed
          </p>
        </div>
        <button
          onClick={() => setIsNewOrderOpen(true)}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} /> New Walk-in Order
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-6">
        {[
          { id: "pending", label: "Pending Tests", count: pending.length },
          { id: "history", label: "Completed", count: history.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-800 text-teal-600 border border-b-white dark:border-slate-700 dark:border-b-slate-800 -mb-px"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
            <span className="bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FlaskConical
            size={48}
            className="text-slate-300 dark:text-slate-600 mb-4"
          />
          <p className="text-slate-500 font-medium text-lg">
            {activeTab === "pending"
              ? "No pending tests"
              : "No completed tests yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedOrder(o.id)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 text-left hover:shadow-md hover:border-teal-300 dark:hover:border-teal-600 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                  <FlaskConical size={20} className="text-teal-600" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                    o.status === "completed"
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-500"
                      : o.status === "in_progress"
                      ? "bg-amber-500 text-white"
                      : "bg-teal-500 text-white"
                  }`}
                >
                  {o.status.replace("_", " ")}
                </span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white">
                {o.test_name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {o.patient_file?.first_name} {o.patient_file?.last_name}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {o.ordered_by ? `Ordered by Dr. ${o.ordered_by.name}` : "Walk-in"}
              </p>
              {o.sent_at && (
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-2 flex items-center gap-1">
                  <Mail size={10} /> Sent
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onCreated={() => {
          setIsNewOrderOpen(false);
          fetchAll();
        }}
      />
    </div>
  );
}

// ── ORDER DETAIL ───────────────────────────────────────────────────────────
function OrderDetail({ orderId, onBack }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [sending, setSending] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/lab-orders/${orderId}`);
      setOrder(res.data);
      setSendEmail(res.data.patient_file?.email || "");
    } catch {
      toast.error("Failed to load order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleMarkInProgress = async () => {
    try {
      await api.patch(`/lab-orders/${orderId}/in-progress`);
      toast.success("Marked in progress.");
      fetchOrder();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!summary && !file) return toast.error("Add a summary, a file, or both.");
    setSaving(true);
    try {
      const formData = new FormData();
      if (summary) formData.append("result_summary", summary);
      if (file) formData.append("result_file", file);
      await api.post(`/lab-orders/${orderId}/result`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Result saved. Test marked complete.");
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save result.");
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!sendEmail) return toast.error("Enter an email address.");
    setSending(true);
    try {
      await api.post(`/lab-orders/${orderId}/send`, { email: sendEmail });
      toast.success(`Result sent to ${sendEmail}.`);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send result.");
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return <div className="p-6 text-slate-400 animate-pulse">Loading...</div>;

  const isCompleted = order.status === "completed";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors text-sm font-medium mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} /> All Orders
      </button>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {order.test_name}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {order.patient_file?.first_name} {order.patient_file?.last_name}{" "}
              · {order.patient_file?.folder?.folder_name}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide flex-shrink-0 ${
              order.status === "completed"
                ? "bg-slate-200 dark:bg-slate-700 text-slate-500"
                : order.status === "in_progress"
                ? "bg-amber-500 text-white"
                : "bg-teal-500 text-white"
            }`}
          >
            {order.status.replace("_", " ")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-100 dark:border-slate-700">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Ordered By
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              {order.ordered_by ? `Dr. ${order.ordered_by.name}` : "Walk-in"}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-100 dark:border-slate-700">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Price
            </p>
            <p className="text-sm font-bold text-teal-600">
              {formatNGN(order.price)}
            </p>
          </div>
        </div>

        {order.status === "pending" && (
          <button
            onClick={handleMarkInProgress}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer"
          >
            <Clock size={16} /> Mark In Progress
          </button>
        )}
      </div>

      {!isCompleted ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Record Result
          </p>
          <form onSubmit={handleSaveResult} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Result Summary
              </label>
              <textarea
                rows={3}
                placeholder="Typed summary of the result"
                className={`${inputClass} resize-none`}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Result File (PDF or photo)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className={inputClass}
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all cursor-pointer"
            >
              <Upload size={16} /> {saving ? "Saving..." : "Save Result & Mark Complete"}
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Result
            </p>
            {order.result_summary && (
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                {order.result_summary}
              </p>
            )}
            {order.result_file_name && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700">
                <FileText size={16} className="text-teal-500" />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {order.result_file_name}
                </span>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-3">
              Completed by {order.lab_staff?.name} on{" "}
              {new Date(order.completed_at).toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Send to Patient
            </p>
            {order.sent_at ? (
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm font-bold">
                <CheckCircle size={16} /> Sent to {order.sent_to_email} on{" "}
                {new Date(order.sent_at).toLocaleString()}
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex flex-col md:flex-row gap-3">
                <input
                  type="email"
                  placeholder="patient@email.com"
                  className={`${inputClass} flex-1`}
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all cursor-pointer flex-shrink-0"
                >
                  <Send size={16} /> {sending ? "Sending..." : "Send Email"}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── NEW WALK-IN ORDER MODAL ────────────────────────────────────────────────
function NewOrderModal({ isOpen, onClose, onCreated }) {
  const [search, setSearch] = useState("");
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [testCatalog, setTestCatalog] = useState([]);
  const [lines, setLines] = useState([{ lab_test_id: "", test_name: "", price: "" }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setFolders([]);
      setSelectedFolder(null);
      setSelectedFile(null);
      setLines([{ lab_test_id: "", test_name: "", price: "" }]);
      return;
    }
    api.get("/lab-tests").then((res) => setTestCatalog(res.data || []));
  }, [isOpen]);

  useEffect(() => {
    if (!search) return setFolders([]);
    const t = setTimeout(() => {
      api.get("/folders", { params: { search } }).then((res) => setFolders(res.data));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openFolder = async (folder) => {
    const res = await api.get(`/folders/${folder.id}`);
    setSelectedFolder(res.data);
  };

  const selectTestForLine = (i, testId) => {
    const test = testCatalog.find((t) => String(t.id) === String(testId));
    setLines((prev) => {
      const next = [...prev];
      next[i] = {
        lab_test_id: testId,
        test_name: test?.name || "",
        price: test?.price || "",
      };
      return next;
    });
  };

  const handleSubmit = async () => {
    const validLines = lines.filter((l) => l.test_name && l.price);
    if (validLines.length === 0) return toast.error("Add at least one test.");
    setSaving(true);
    try {
      await api.post(`/lab-orders/files/${selectedFile.id}`, { tests: validLines });
      toast.success(`${validLines.length} test(s) ordered.`);
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create order.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700 shadow-2xl z-10 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Walk-in Order</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {!selectedFile ? (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by family name or phone..."
                className={`${inputClass} pl-11`}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedFolder(null);
                }}
              />
            </div>

            {!selectedFolder ? (
              <div className="space-y-2">
                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => openFolder(f)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-left cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{f.folder_name}</p>
                      <p className="text-xs text-slate-400">{f.phone}</p>
                    </div>
                  </button>
                ))}
                {search && folders.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No folder found. Register the patient in Medical Records first.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="text-xs text-teal-600 font-bold mb-3 cursor-pointer"
                >
                  ← Back to search
                </button>
                <div className="space-y-2">
                  {selectedFolder.files?.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-left cursor-pointer"
                    >
                      <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm uppercase">
                        {file.first_name?.charAt(0)}
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {file.first_name} {file.last_name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between bg-teal-50 dark:bg-teal-500/10 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm font-bold text-teal-700 dark:text-teal-400">
                {selectedFile.first_name} {selectedFile.last_name}
              </p>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs text-teal-600 font-bold cursor-pointer"
              >
                Change
              </button>
            </div>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tests</p>
            <div className="space-y-3 mb-4">
              {lines.map((line, i) => (
                <div key={i} className="flex gap-2">
                  <select
                    className={`${inputClass} flex-1`}
                    value={line.lab_test_id}
                    onChange={(e) => selectTestForLine(i, e.target.value)}
                  >
                    <option value="">Select a test...</option>
                    {testCatalog.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} — {formatNGN(t.price)}
                      </option>
                    ))}
                  </select>
                  {lines.length > 1 && (
                    <button
                      onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                      className="p-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setLines((prev) => [...prev, { lab_test_id: "", test_name: "", price: "" }])}
              className="flex items-center gap-1 text-teal-600 text-xs font-bold mb-5 cursor-pointer"
            >
              <Plus size={14} /> Add another test
            </button>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all cursor-pointer"
            >
              {saving ? "Creating..." : "Create Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
