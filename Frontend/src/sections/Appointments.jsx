import React, { useEffect, useState } from "react";
import {
  User,
  Calendar,
  Clock,
  Search,
  Stethoscope,
  Check,
  X,
  Inbox,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 text-sm";

export default function AdminSchedule() {
  const [activeTab, setActiveTab] = useState("all");
  const [pendingCount, setPendingCount] = useState(0);

  return (
    <div className="p-2 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Schedules
      </h2>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-6">
        {[
          { id: "all", label: "All Schedules" },
          { id: "sync", label: "Sync Requests", count: pendingCount },
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
            {typeof tab.count === "number" && tab.count > 0 && (
              <span className="bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "all" ? (
        <AllSchedulesTab />
      ) : (
        <SyncRequestsTab onPendingCountChange={setPendingCount} />
      )}
    </div>
  );
}

// ── ALL SCHEDULES TAB ─────────────────────────────────────────────────────
function AllSchedulesTab() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/schedules");
      setAppointments(res.data?.data || res.data);
    } catch {
      toast.error("Error loading schedules.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400";
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "cancelled":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-slate-500/10 text-slate-500 dark:text-slate-400";
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    const patient = appt.patient?.name?.toLowerCase() || "";
    const doctor = appt.doctor?.name?.toLowerCase() || "";
    const date = appt.appointment_date || "";
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      patient.includes(search) ||
      doctor.includes(search) ||
      date.includes(search);
    const matchesStatus = statusFilter
      ? appt.status?.toLowerCase() === statusFilter
      : true;
    return matchesSearch && matchesStatus;
  });

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading Schedules...
      </div>
    );

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div className="relative w-full md:max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by patient, doctor or date..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 dark:text-white cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <span className="bg-white dark:bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-500 font-bold shadow-sm text-xs">
            {filteredAppointments.length} results
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredAppointments.map((appt) => (
          <div
            key={appt.id}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Appt. #{appt.id}
              </p>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(
                  appt.status
                )}`}
              >
                ● {appt.status || "Pending"}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                <User size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Patient
                </p>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {appt.patient?.name || "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <Stethoscope size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Doctor
                </p>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  Dr. {appt.doctor?.name || "Unassigned"}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                <Calendar size={16} className="text-teal-500" />{" "}
                {appt.appointment_date}
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                <Clock size={16} className="text-teal-500" />{" "}
                {appt.appointment_time}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-transparent">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                Reason for visit
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed line-clamp-2">
                {appt.additional_notes
                  ? `"${appt.additional_notes}"`
                  : "No additional notes provided."}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SYNC REQUESTS TAB ──────────────────────────────────────────────────────
function SyncRequestsTab({ onPendingCountChange }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Deciding whether to take an online booking is the requested doctor's
  // call — reception only gets a read-only view here (admin can still act,
  // standing in for a doctor). See routes/api.php's sync-requests group.
  const currentUser = JSON.parse(localStorage.getItem("a4_user") || "null");
  const canAct = currentUser?.role?.toLowerCase() === "admin";

  const [isDeclineSidebarOpen, setIsDeclineSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  const [folderPrefill, setFolderPrefill] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/sync-requests");
      setRequests(res.data || []);
      onPendingCountChange?.(
        (res.data || []).filter((r) => r.status === "pending").length
      );
    } catch {
      toast.error("Error loading sync requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = async (request) => {
    try {
      await api.patch(`/sync-requests/${request.id}/confirm`);
      toast.success("Booking confirmed — create a patient folder next.");
      setFolderPrefill(request);
      fetchRequests();
    } catch {
      toast.error("Failed to confirm request.");
    }
  };

  const submitDecline = async () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining.");
      return;
    }
    try {
      await api.patch(`/sync-requests/${selectedRequest.id}/decline`, {
        decline_reason: declineReason,
      });
      toast.success("Request declined.");
      setIsDeclineSidebarOpen(false);
      setDeclineReason("");
      fetchRequests();
    } catch {
      toast.error("Failed to decline request.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400";
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "declined":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-slate-500/10 text-slate-500 dark:text-slate-400";
    }
  };

  const filteredRequests = requests.filter((r) => {
    const search = searchTerm.toLowerCase();
    return (
      r.patient_name?.toLowerCase().includes(search) ||
      r.appointment_date?.includes(search)
    );
  });

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading sync requests...
      </div>
    );

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div className="relative w-full md:max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by patient name or date..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="bg-white dark:bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-500 font-bold shadow-sm text-xs">
          {filteredRequests.length} results
        </span>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Inbox size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 font-medium text-lg">
            No online booking requests right now
          </p>
          <p className="text-slate-400 text-sm mt-1">
            New requests appear here automatically every few minutes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredRequests.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                        {r.patient_name}
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                        {r.patient_phone || "No phone provided"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(
                      r.status
                    )}`}
                  >
                    ● {r.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <Calendar size={16} className="text-teal-500" />{" "}
                    {r.appointment_date}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                    <Clock size={16} className="text-teal-500" />{" "}
                    {r.appointment_time}
                  </div>
                  {r.requested_doctor_name && (
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                      <Stethoscope size={16} className="text-purple-500" /> Dr.{" "}
                      {r.requested_doctor_name}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-transparent">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                    Reason for visit
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed line-clamp-2">
                    {r.reason ? `"${r.reason}"` : "No reason provided."}
                  </p>
                  {r.status === "declined" && r.decline_reason && (
                    <p className="text-red-500 dark:text-red-400 text-xs font-semibold mt-2">
                      Declined: {r.decline_reason}
                    </p>
                  )}
                </div>
              </div>

              {r.status === "pending" ? (
                canAct ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConfirm(r)}
                      className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-teal-500/20"
                    >
                      <Check size={18} /> Confirm
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(r);
                        setIsDeclineSidebarOpen(true);
                      }}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-600 dark:text-white hover:text-red-600 dark:hover:text-red-500 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <X size={18} /> Decline
                    </button>
                  </div>
                ) : (
                  <div className="w-full py-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold rounded-xl text-center text-xs border border-amber-100 dark:border-amber-500/20 uppercase tracking-widest">
                    Waiting for{" "}
                    {r.requested_doctor_name
                      ? `Dr. ${r.requested_doctor_name}`
                      : "the doctor"}
                  </div>
                )
              ) : r.status === "confirmed" ? (
                <button
                  onClick={() => setFolderPrefill(r)}
                  className="w-full py-3 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold rounded-xl text-center text-xs border border-teal-100 dark:border-teal-500/20 uppercase tracking-widest cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-all"
                >
                  Create Patient Folder
                </button>
              ) : (
                <div className="w-full py-3 bg-slate-50 dark:bg-slate-900/50 text-slate-400 font-bold rounded-xl text-center text-xs border border-slate-100 dark:border-slate-700 uppercase tracking-widest">
                  Action Completed
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decline Sidebar — same interaction pattern as the doctor's own accept/decline queue */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isDeclineSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsDeclineSidebarOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 p-8 transform transition-transform duration-300 border-l border-slate-200 dark:border-slate-700 ${
            isDeclineSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-red-500">Decline Request</h2>
            <button
              onClick={() => setIsDeclineSidebarOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <div className="bg-red-50 dark:bg-red-500/10 p-5 rounded-2xl mb-6 border border-red-100 dark:border-transparent">
            <p className="text-sm text-red-700 dark:text-red-300">
              Declining{" "}
              <span className="font-bold">{selectedRequest?.patient_name}</span>{" "}
              on{" "}
              <span className="font-bold">
                {selectedRequest?.appointment_date}
              </span>
              .
            </p>
          </div>
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-3 tracking-widest">
            Reason
          </label>
          <textarea
            className="w-full h-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all placeholder:text-slate-400"
            placeholder="Tell the patient why this can't be accommodated..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
          <button
            onClick={submitDecline}
            className="w-full mt-6 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/25 cursor-pointer"
          >
            Confirm Decline
          </button>
        </div>
      </div>

      <CreateFolderModal
        request={folderPrefill}
        onClose={() => setFolderPrefill(null)}
      />
    </div>
  );
}

// ── CREATE PATIENT FOLDER (from a confirmed sync request) ─────────────────
function CreateFolderModal({ request, onClose }) {
  const [form, setForm] = useState({ folder_name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  useEffect(() => {
    if (request) {
      setForm({
        folder_name: request.patient_name || "",
        phone: request.patient_phone || "",
        address: "",
      });
    }
  }, [request]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.folder_name || !form.phone)
      return toast.error("Name and phone are required.");
    setSaving(true);
    try {
      await api.post("/folders", form);
      toast.success("Patient folder created.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create folder.");
    } finally {
      setSaving(false);
    }
  };

  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Create Patient Folder
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">
              Pre-filled from the online booking — review before saving. If
              this family already has a folder, close this and add them there
              instead.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Folder / Family Name
            </label>
            <input
              type="text"
              className={inputClass}
              value={form.folder_name}
              onChange={(e) => set("folder_name", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Phone
            </label>
            <input
              type="text"
              className={inputClass}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Address
            </label>
            <input
              type="text"
              className={inputClass}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all cursor-pointer"
          >
            {saving ? "Creating..." : "Create Folder"}
          </button>
        </form>
      </div>
    </div>
  );
}
