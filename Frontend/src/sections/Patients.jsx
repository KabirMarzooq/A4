import React, { useEffect, useState } from "react";
import {
  User,
  Calendar,
  Clock,
  Search,
  FileText,
  MessageSquare,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

export default function MyPatients() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchConfirmedPatients();
  }, []);

  const fetchConfirmedPatients = async () => {
    try {
      // for confirmed appointments, e.g., `/doctor/appointments?status=confirmed`
      const res = await api.get("/doctor/appointments");

      // Filtering out only the confirmed appointments on the frontend also
      const confirmedOnly = res.data.filter(
        (appt) => appt.status?.toLowerCase() === "confirmed"
      );

      setAppointments(confirmedOnly);
    } catch (err) {
      toast.error("Error loading patient list.");
    } finally {
      setLoading(false);
    }
  };

  // Add this helper outside the component
  const getWhatsAppUrl = (phone) => {
    if (!phone) return "https://wa.me/"; // fallback, button will still open WA
    const stripped = phone.replace(/\D/g, ""); // remove any non-digits
    const withCountryCode = stripped.startsWith("0")
      ? "234" + stripped.slice(1) // replace leading 0 with 234
      : stripped.startsWith("234")
      ? stripped // already has country code
      : "234" + stripped; // no leading 0, just prepend
    return `https://wa.me/${withCountryCode}`;
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
        Loading Patients...
      </div>
    );

  return (
    <div className="p-2 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        My Patients
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
            Total Confirmed:
          </span>
          <span className="bg-white dark:bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-500 font-bold shadow-sm">
            {filteredAppointments.length}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredAppointments.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium">
            No confirmed patients found.
          </div>
        )}

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
                      Patient ID: #{appt.patient_id || appt.id}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  ● Confirmed
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

            <button
              onClick={() => {
                const url = getWhatsAppUrl(appt.patient?.phone);
                if (!appt.patient?.phone) {
                  toast.error("No phone number on record for this patient.");
                  return;
                }
                window.open(url, "_blank");
              }}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare size={18} /> Message
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
