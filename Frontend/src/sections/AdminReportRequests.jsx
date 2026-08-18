import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  X,
  Search,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

export default function AdminReportRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [rejectModal, setRejectModal] = useState(null); // holds request being rejected

  const fetchRequests = async () => {
    try {
      const res = await api.get("/admin/report-requests");
      setRequests(res.data);
    } catch {
      toast.error("Failed to load report requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/report-requests/${id}/approve`);
      toast.success("Request approved. Patient can now access their report.");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve request.");
    }
  };

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patient?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pending = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading report requests...
      </div>
    );

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Medical Report Requests
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Review and action patient requests for medical records
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Pending Review"
          value={pending}
          icon={<Clock size={20} />}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatCard
          label="Approved"
          value={approved}
          icon={<CheckCircle size={20} />}
          color="text-teal-500"
          bg="bg-teal-500/10"
        />
        <StatCard
          label="Rejected"
          value={rejected}
          icon={<XCircle size={20} />}
          color="text-red-500"
          bg="bg-red-500/10"
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
          {["all", "pending", "approved", "rejected"].map((status) => (
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

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <FileText
              size={28}
              className="text-slate-300 dark:text-slate-600"
            />
          </div>
          <p className="text-slate-500 font-medium">No requests found</p>
          <p className="text-slate-400 text-sm mt-1">
            {filterStatus !== "all"
              ? `No ${filterStatus} requests at this time.`
              : "No report requests have been submitted yet."}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((req) => (
          <RequestRow
            key={req.id}
            request={req}
            onApprove={() => handleApprove(req.id)}
            onReject={() => setRejectModal(req)}
          />
        ))}
      </div>

      {rejectModal && (
        <RejectModal
          request={rejectModal}
          onClose={() => setRejectModal(null)}
          onRejected={() => {
            fetchRequests();
            setRejectModal(null);
          }}
        />
      )}
    </div>
  );
}

function RequestRow({ request, onApprove, onReject }) {
  const statusConfig = {
    pending: {
      icon: <Clock size={13} />,
      label: "Pending",
      style:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    },
    approved: {
      icon: <CheckCircle size={13} />,
      label: "Approved",
      style:
        "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 border-teal-200 dark:border-teal-500/30",
    },
    rejected: {
      icon: <XCircle size={13} />,
      label: "Rejected",
      style:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30",
    },
  };

  const config = statusConfig[request.status];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
   
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center font-bold text-white text-lg uppercase flex-shrink-0">
            {request.patient?.name?.charAt(0) || "P"}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-bold text-slate-900 dark:text-white">
                {request.patient?.name || "Unknown Patient"}
              </p>
              <span
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${config.style}`}
              >
                {config.icon} {config.label}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-2">
              {request.patient?.email}
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={11} className="text-teal-500" />
                Records:{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  {new Date(request.date_from).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  →{" "}
                  {new Date(request.date_to).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-slate-400" />
                Submitted:{" "}
                {new Date(request.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <p className="text-xs text-slate-400 italic mt-1.5">
              "{request.reason}"
            </p>

            {request.status === "rejected" && request.rejection_reason && (
              <div className="mt-2 flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">
                <XCircle
                  size={12}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <p className="text-xs text-red-600 dark:text-red-400">
                  <span className="font-bold">Rejection reason:</span>{" "}
                  {request.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </div>

        {request.status === "pending" && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onReject}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-2xl font-bold text-sm transition-all"
            >
              <XCircle size={15} /> Reject
            </button>
            <button
              onClick={onApprove}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-95"
            >
              <CheckCircle size={15} /> Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RejectModal({ request, onClose, onRejected }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim())
      return toast.error("Please provide a rejection reason.");
    setSaving(true);
    try {
      await api.patch(`/admin/report-requests/${request.id}/reject`, {
        rejection_reason: reason,
      });
      toast.success("Request rejected.");
      onRejected();
    } catch {
      toast.error("Failed to reject request.");
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
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl z-10">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Reject Request
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">
              For {request.patient?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 mb-5">
          <AlertCircle
            size={16}
            className="text-red-500 flex-shrink-0 mt-0.5"
          />
          <p className="text-xs text-red-600 dark:text-red-400">
            The patient will be notified that their request was rejected and
            will see your reason. Please be clear and professional.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Reason for Rejection
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Insufficient information provided, request outside policy scope..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-red-500/20"
            >
              {saving ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
    <div
      className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center flex-shrink-0`}
    >
      {icon}
    </div>
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
        {label}
      </p>
      <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </h4>
    </div>
  </div>
);
