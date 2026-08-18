import React, { useEffect, useState } from "react";
import { User, Calendar, Clock, Check, X, Search } from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

export default function DoctorSchedule() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDeclineSidebarOpen, setIsDeclineSidebarOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get("/doctor/appointments");
      setAppointments(res.data);
    } catch (err) {
      toast.error("Error loading schedule queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.patch(`/doctor/appointments/${id}/accept`);
      toast.success("Appointment Confirmed!");
      fetchQueue();
    } catch (err) {
      toast.error("Failed to accept appointment.");
    }
  };

  const submitDecline = async () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining.");
      return;
    }
    try {
      await api.patch(`/doctor/appointments/${selectedAppt.id}/decline`, {
        cancellation_reason: declineReason,
      });
      toast.success("Appointment Declined.");
      setIsDeclineSidebarOpen(false);
      setDeclineReason("");
      fetchQueue();
    } catch (err) {
      toast.error("Failed to decline appointment.");
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
    const name = appt.patient?.name?.toLowerCase() || "";
    const date = appt.appointment_date || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || date.includes(search);
  });

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading Schedule...
      </div>
    );

  return (
    <div className="p-2 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Incoming Requests & Schedule
      </h2>

      {/* Search & Stats Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div className="relative w-full md:max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by patient name or date..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm dark:shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase tracking-widest text-slate-400">
            Results:
          </span>
          <span className="bg-white dark:bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-500 font-bold shadow-sm">
            {filteredAppointments.length}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredAppointments.map((appt) => (
          <div
            key={appt.id}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div>
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                      {appt.patient?.name || "Unknown"}
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                      Patient ID: #{appt.id}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(appt.status)}`}
                >
                  ● {appt.status || "Pending"}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                  <Calendar size={16} className="text-teal-500" />{" "}
                  {appt.appointment_date}
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                  <Clock size={16} className="text-teal-500" />{" "}
                  {appt.appointment_time}
                </div>
              </div>

              {/* Patient Notes Area */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-transparent">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Reason for visit
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed line-clamp-2">
                  {appt.additional_notes
                    ? `"${appt.additional_notes}"`
                    : "No additional notes provided."}
                </p>
              </div>
            </div>

            {/* Buttons */}
            {appt.status?.toLowerCase() === "pending" ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAccept(appt.id)}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-teal-500/20"
                >
                  <Check size={18} /> Accept
                </button>
                <button
                  onClick={() => {
                    setSelectedAppt(appt);
                    setIsDeclineSidebarOpen(true);
                  }}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-600 dark:text-white hover:text-red-600 dark:hover:text-red-500 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <X size={18} /> Decline
                </button>
              </div>
            ) : (
              <div className="w-full py-3 bg-slate-50 dark:bg-slate-900/50 text-slate-400 font-bold rounded-xl text-center text-xs border border-slate-100 dark:border-slate-700 uppercase tracking-widest">
                Action Completed
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Decline Sidebar */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${isDeclineSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsDeclineSidebarOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 p-8 transform transition-transform duration-300 border-l border-slate-200 dark:border-slate-700 ${isDeclineSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
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
              <span className="font-bold">{selectedAppt?.patient?.name}</span>{" "}
              on{" "}
              <span className="font-bold">
                {selectedAppt?.appointment_date}
              </span>
              .
            </p>
          </div>
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-3 tracking-widest">
            Cancellation Reason
          </label>
          <textarea
            className="w-full h-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none transition-all placeholder:text-slate-400"
            placeholder="Tell the patient why you can't make it..."
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
          <button
            onClick={submitDecline}
            className="w-full mt-6 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/25 cursor-pointer"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}
