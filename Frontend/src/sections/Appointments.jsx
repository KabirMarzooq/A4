import React, { useEffect, useState } from "react";
import { User, Calendar, Clock, Search, Stethoscope } from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

export default function AdminSchedule() {
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
    <div className="p-2 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        All Doctor Schedules
      </h2>

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
