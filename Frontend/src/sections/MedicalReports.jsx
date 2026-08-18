import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  X,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Printer,
  ChevronRight,
  ShieldAlert,
  Pill,
  Stethoscope,
  Activity,
  Thermometer,
  Heart,
  Wind,
  Droplets,
  User,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

export default function MedicalReport() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState(null); // holds full report data

  const fetchRequests = async () => {
    try {
      const res = await api.get("/patient/report-requests");
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

  const handleViewReport = async (requestId) => {
    try {
      const res = await api.get(`/patient/report-requests/${requestId}/report`);
      setViewingReport(res.data);
    } catch {
      toast.error("Failed to load report.");
    }
  };

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading report history...
      </div>
    );

  // If you are viewing a report, show the full report view
  if (viewingReport) {
    return (
      <ReportView data={viewingReport} onBack={() => setViewingReport(null)} />
    );
  }

  const pendingRequest = requests.find((r) => r.status === "pending");

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Medical Report
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Request and access your official medical records
          </p>
        </div>

        {!pendingRequest && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} /> Request Medical Report
          </button>
        )}
      </div>

      {/* Pending request banner */}
      {pendingRequest && (
        <div className="flex items-start gap-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-5 mb-6">
          <AlertCircle
            size={20}
            className="text-amber-500 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1">
            <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">
              Request Under Review
            </p>
            <p className="text-amber-600 dark:text-amber-500 text-xs mt-1">
              Your request submitted on{" "}
              {new Date(pendingRequest.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              is currently being reviewed by the admin. You will be notified
              once it is approved.
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5">
            <FileText
              size={36}
              className="text-slate-300 dark:text-slate-600"
            />
          </div>
          <h3 className="text-slate-700 dark:text-slate-300 font-bold text-lg mb-2">
            No Report Requests Yet
          </h3>
          <p className="text-slate-400 text-sm max-w-sm">
            You haven't requested any medical reports. Click "Request Medical
            Report" to get started.
          </p>
        </div>
      )}

      {/* The Request History List */}
      {requests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Request History
          </h3>
          {requests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onView={() => handleViewReport(req.id)}
            />
          ))}
        </div>
      )}

      {/* The Request Form Slide-over */}
      <RequestForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmitted={() => {
          fetchRequests();
          setIsFormOpen(false);
        }}
      />
    </div>
  );
}

function RequestCard({ request, onView }) {
  const statusConfig = {
    pending: {
      icon: <Clock size={14} />,
      label: "Pending Review",
      style:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    },
    approved: {
      icon: <CheckCircle size={14} />,
      label: "Approved",
      style:
        "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 border-teal-200 dark:border-teal-500/30",
    },
    rejected: {
      icon: <XCircle size={14} />,
      label: "Rejected",
      style:
        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30",
    },
  };

  const config = statusConfig[request.status];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 bg-teal-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${config.style}`}
              >
                {config.icon} {config.label}
              </span>
              <span className="text-xs text-slate-400">
                Requested{" "}
                {new Date(request.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Records from{" "}
              <span className="text-teal-600">
                {new Date(request.date_from).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>{" "}
              to{" "}
              <span className="text-teal-600">
                {new Date(request.date_to).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-1 italic">
              Reason: {request.reason}
            </p>
            {request.status === "rejected" && request.rejection_reason && (
              <div className="mt-2 flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">
                <XCircle
                  size={13}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <p className="text-xs text-red-600 dark:text-red-400">
                  <span className="font-bold">Reason for rejection:</span>{" "}
                  {request.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </div>

        {request.status === "approved" && (
          <button
            onClick={onView}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95 flex-shrink-0 cursor-pointer"
          >
            View Report <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function RequestForm({ isOpen, onClose, onSubmitted }) {
  const [form, setForm] = useState({
    date_from: "",
    date_to: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date_from || !form.date_to || !form.reason) {
      return toast.error("Please fill in all fields.");
    }
    if (new Date(form.date_to) < new Date(form.date_from)) {
      return toast.error("End date must be after start date.");
    }
    setSaving(true);
    try {
      await api.post("/patient/report-requests", form);
      toast.success("Request submitted! Awaiting admin approval.");
      setForm({ date_from: "", date_to: "", reason: "" });
      onSubmitted();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit request.";
      toast.error(msg);
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
              Request Medical Report
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Your request will be reviewed by the admin
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 mb-6">
          <AlertCircle
            size={16}
            className="text-blue-500 flex-shrink-0 mt-0.5"
          />
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Medical records are hospital property. Your request will be reviewed
            by an administrator before access is granted. Please provide a valid
            reason.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Date Range of Records
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                  From
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.date_from}
                  onChange={(e) => set("date_from", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                  To
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.date_to}
                  onChange={(e) => set("date_to", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Reason for Request
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Required for a second opinion at another hospital, insurance purposes..."
              className={`${inputClass} resize-none`}
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/25 cursor-pointer"
          >
            {saving ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ReportView({ data, onBack }) {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Report — ${data.patient.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; font-size: 13px; line-height: 1.6; }
            .report-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #14b8a6; padding-bottom: 20px; margin-bottom: 24px; }
            .hospital-name { font-size: 22px; font-weight: 800; color: #0f766e; letter-spacing: -0.5px; }
            .hospital-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
            .report-meta { text-align: right; font-size: 11px; color: #64748b; }
            .report-meta strong { display: block; font-size: 13px; color: #1e293b; }
            .patient-header { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .patient-name { font-size: 20px; font-weight: 800; color: #0f172a; grid-column: 1/-1; }
            .metric { }
            .metric-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
            .metric-value { font-size: 13px; font-weight: 600; color: #1e293b; }
            .alert-box { border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; }
            .alert-allergy { background: #fef2f2; border: 1px solid #fecaca; }
            .alert-condition { background: #fffbeb; border: 1px solid #fde68a; }
            .alert-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
            .alert-allergy .alert-label { color: #dc2626; }
            .alert-condition .alert-label { color: #d97706; }
            .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin: 24px 0 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
            .visit-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 12px; page-break-inside: avoid; }
            .visit-date { font-size: 13px; font-weight: 700; color: #0f766e; margin-bottom: 8px; }
            .visit-doctor { font-size: 11px; color: #64748b; margin-bottom: 10px; }
            .complaint-box { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 6px; padding: 10px 12px; margin-bottom: 10px; }
            .complaint-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #0f766e; margin-bottom: 3px; }
            .vitals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
            .vital { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; }
            .vital-label { font-size: 9px; text-transform: uppercase; color: #94a3b8; font-weight: 700; }
            .vital-value { font-size: 12px; font-weight: 600; }
            .field-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px; margin-top: 8px; }
            .rx-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 10px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; page-break-inside: avoid; }
            .rx-name { font-size: 15px; font-weight: 800; color: #0f172a; grid-column: 1/-1; margin-bottom: 4px; }
            .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const { patient, records, prescriptions, request } = data;
  const profile = patient?.profile;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors text-sm font-medium cursor-pointer"
        >
          ← Back to Requests
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Printer size={16} /> Print / Download
        </button>
      </div>

      <div
        ref={printRef}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm"
      >
        <div className="flex justify-between items-start border-b-2 border-teal-500 pb-5 mb-6">
          <div>
            <h1 className="text-2xl font-black text-teal-700 dark:text-teal-400 tracking-tight">
              A4 Medical
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Hospital Management System
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Official Medical Report</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              Period:{" "}
              {new Date(request.date_from).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              —{" "}
              {new Date(request.date_to).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Generated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3">
            {patient.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              {
                label: "Blood Type",
                value: profile?.blood_type || "—",
                icon: <Droplets size={12} />,
              },
              {
                label: "Gender",
                value: profile?.gender || "—",
                icon: <User size={12} />,
              },
              {
                label: "Age",
                value: profile?.date_of_birth
                  ? `${calcAge(profile.date_of_birth)} yrs`
                  : "—",
                icon: <Calendar size={12} />,
              },
              {
                label: "Height",
                value: profile?.height_cm ? `${profile.height_cm} cm` : "—",
                icon: <Activity size={12} />,
              },
              {
                label: "Weight",
                value: profile?.weight_kg ? `${profile.weight_kg} kg` : "—",
                icon: <Activity size={12} />,
              },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {m.icon} {m.label}
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {(profile?.allergies || profile?.chronic_conditions) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {profile?.allergies && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3">
                  <ShieldAlert
                    size={14}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      Allergies
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-400">
                      {profile.allergies}
                    </p>
                  </div>
                </div>
              )}
              {profile?.chronic_conditions && (
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3">
                  <ShieldAlert
                    size={14}
                    className="text-amber-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      Chronic Conditions
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      {profile.chronic_conditions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visit Records */}
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Stethoscope size={13} /> Visit Records ({records.length})
        </p>

        {records.length === 0 ? (
          <p className="text-sm text-slate-400 italic mb-6">
            No visit records found in this date range.
          </p>
        ) : (
          <div className="space-y-4 mb-6">
            {records.map((record) => (
              <div
                key={record.id}
                className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5"
              >
                <div className="flex justify-between items-start mb-3">
                  <p className="font-bold text-teal-600 dark:text-teal-400">
                    {new Date(record.visit_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-slate-400">
                    Dr. {record.doctor?.name}
                  </p>
                </div>

                <div className="bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 rounded-xl px-4 py-3 mb-3">
                  <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
                    Chief Complaint
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {record.chief_complaint}
                  </p>
                </div>

                {(record.blood_pressure ||
                  record.temperature_c ||
                  record.heart_rate ||
                  record.oxygen_saturation) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {record.blood_pressure && (
                      <VitalChip
                        icon={<Activity size={11} />}
                        label="BP"
                        value={record.blood_pressure}
                        color="text-red-500"
                      />
                    )}
                    {record.temperature_c && (
                      <VitalChip
                        icon={<Thermometer size={11} />}
                        label="Temp"
                        value={`${record.temperature_c}°C`}
                        color="text-orange-500"
                      />
                    )}
                    {record.heart_rate && (
                      <VitalChip
                        icon={<Heart size={11} />}
                        label="Heart Rate"
                        value={`${record.heart_rate} bpm`}
                        color="text-pink-500"
                      />
                    )}
                    {record.oxygen_saturation && (
                      <VitalChip
                        icon={<Wind size={11} />}
                        label="SpO2"
                        value={`${record.oxygen_saturation}%`}
                        color="text-blue-500"
                      />
                    )}
                  </div>
                )}

                {record.diagnosis && (
                  <div className="mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Diagnosis
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {record.diagnosis}
                    </p>
                  </div>
                )}
                {record.notes && (
                  <div className="mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-slate-400 italic">
                      {record.notes}
                    </p>
                  </div>
                )}
                {record.action_taken && (
                  <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold">Action Taken:</span>{" "}
                    {record.action_taken}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Prescriptions */}
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Pill size={13} /> Prescriptions ({prescriptions.length})
        </p>

        {prescriptions.length === 0 ? (
          <p className="text-sm text-slate-400 italic mb-6">
            No prescriptions found in this date range.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {prescriptions.map((p) => (
              <div
                key={p.id}
                className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <p className="font-bold text-slate-900 dark:text-white text-base">
                    {p.medication}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {p.created_at?.split("T")[0]}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 space-y-1.5">
                  {[
                    { label: "Dosage", value: p.dosage },
                    { label: "Frequency", value: p.frequency },
                    { label: "Duration", value: p.duration },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between text-xs"
                    >
                      <span className="text-slate-400 font-bold uppercase">
                        {row.label}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                {p.instructions && (
                  <p className="text-xs text-slate-400 italic mt-2">
                    {p.instructions}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Prescribed by Dr. {p.doctor?.name}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-col md:flex-row justify-between gap-2 text-xs text-slate-400">
          <p>This is an official medical report generated by A4 Medical Consortium HMS.</p>
          <p>
            Approved by Admin on{" "}
            {new Date(request.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 text-sm";

const VitalChip = ({ icon, label, value, color }) => (
  <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
    <div
      className={`flex items-center gap-1 ${color} text-[10px] font-bold uppercase tracking-wider mb-1`}
    >
      {icon} {label}
    </div>
    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
      {value}
    </p>
  </div>
);

const calcAge = (dob) => {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};
