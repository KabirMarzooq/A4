import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  ArrowLeftRight,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

export default function Overview() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayCount: 0,
    pendingCount: 0,
    messageCount: 0,
  });
  const [patients, setPatients] = useState([]);
  const [hoveredPatientId, setHoveredPatientId] = useState(null);
  const [transfers, setTransfers] = useState([]);

  // State for appointments Incoming from your Laravel controller
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/doctor/dashboard-overview");
        if (isMounted) {
          setStats(response.data?.stats || {});
          setPatients(response.data?.patients || []);
          // Assuming your Laravel API returns an 'appointments' array for today
          setAppointments(response.data?.appointments || []);
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to load dashboard data"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    api
      .get("/folders/transfers/mine")
      .then((res) => {
        if (isMounted) setTransfers(res.data || []);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading)
    return <div className="p-6 text-slate-400">Loading Dashboard...</div>;

  const filteredPatients = patients.filter((apt) => {
    const matchesSearch = (apt.patient_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (apt.status || "pending").toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Patients"
          value={stats.totalPatients}
          icon={<Users />}
          color="text-teal-500"
          bg="bg-teal-500/10"
        />
        <StatCard
          label="Today's Appts"
          value={stats.todayCount}
          icon={<Calendar />}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingCount}
          icon={<Clock />}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
      </div>

      {transfers.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <ArrowLeftRight size={18} className="text-teal-500" /> Recently
            Transferred to You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transfers.map((t) => (
              <button
                key={t.id}
                onClick={() =>
                  navigate(
                    `/dashboard/medical-records?folderId=${t.patient_file?.patient_folder_id}&fileId=${t.patient_file_id}`
                  )
                }
                className="text-left bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 hover:border-teal-300 dark:hover:border-teal-600 transition-all cursor-pointer"
              >
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {t.patient_file?.first_name} {t.patient_file?.last_name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.patient_file?.folder?.folder_name}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  From {t.from_user?.name || "Reception"}
                  {t.reason ? ` — ${t.reason}` : ""}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none flex items-center gap-2 pl-12 pr-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-5 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                    Patient
                  </th>
                  <th className="p-5 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                    Last Visit
                  </th>
                  <th className="p-5 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                    Condition
                  </th>
                  <th className="p-5 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredPatients.map((apt) => (
                  <tr
                    key={apt.id}
                    onMouseEnter={() => setHoveredPatientId(apt.id)}
                    onMouseLeave={() => setHoveredPatientId(null)}
                    className={`transition-colors cursor-pointer ${
                      hoveredPatientId === apt.id
                        ? "bg-teal-50 dark:bg-teal-900/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    }`}
                  >
                    <td className="p-5">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {apt.patient?.name || apt.patient_name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">
                        #{apt.patient_id?.toString().padStart(4, "0")}
                      </p>
                    </td>

                    <td className="p-5 text-slate-600 dark:text-slate-300 text-sm">
                      {apt.appointment_date || "New Patient"}
                    </td>

                    <td className="p-5">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {apt.reason || "NIL"}
                      </span>
                    </td>

                    <td className="p-5">
                      <StatusBadge status={apt.status || "pending"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* The Daily Timeline View */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Daily Timeline
              </h3>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-500 uppercase tracking-wider">
                Today
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide relative min-h-[500px]">
              <DailyTimeline
                appointments={appointments}
                hoveredId={hoveredPatientId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center gap-5 transition-all shadow-sm">
    <div
      className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center`}
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

const DailyTimeline = ({ appointments, hoveredId }) => {
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  // If no appointments — just show the empty state message
  if (appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center space-y-2">
          <Calendar
            className="mx-auto text-slate-300 dark:text-slate-600"
            size={36}
          />
          <p className="text-slate-400 dark:text-slate-500 text-sm italic">
            No appointments scheduled for today.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {hours.map((hour) => (
        <div
          key={hour}
          className="relative h-20 border-t border-slate-100 dark:border-slate-700/50 flex"
        >
          <span className="absolute -top-3 left-0 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 pr-2">
            {hour > 12
              ? `${hour - 12} PM`
              : hour === 12
              ? "12 PM"
              : `${hour} AM`}
          </span>
        </div>
      ))}

      <div className="absolute top-0 left-12 right-0 bottom-0">
        {appointments.map((apt, index) => {
          const [hourStr, minStr] = apt.appointment_time.split(":");
          const hour = parseInt(hourStr);
          const minutes = parseInt(minStr);
          const topOffset = (hour - 8) * 80 + minutes * (80 / 60);
          const isEven = index % 2 === 0;
          const isHighlighted = hoveredId === apt.patient_id;

          return (
            <div
              key={apt.id || index}
              style={{
                top: `${topOffset}px`,
                height: "70px",
                width: "90%",
                left: isEven ? "0" : "10%",
              }}
              className={`absolute p-3 border-l-4 rounded-r-xl flex flex-col justify-center transition-all duration-300 ${
                isHighlighted
                  ? "bg-teal-500 text-white scale-105 z-20 shadow-lg border-teal-600"
                  : "bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-400"
              }`}
            >
              <p
                className={`text-xs font-bold leading-tight truncate ${
                  isHighlighted
                    ? "text-white"
                    : "text-teal-700 dark:text-teal-400"
                }`}
              >
                {apt.patient_name}
              </p>
              <div
                className={`flex items-center gap-1 text-[10px] font-medium ${
                  isHighlighted
                    ? "text-white/80"
                    : "text-teal-600/70 dark:text-teal-500/70"
                }`}
              >
                <Clock size={10} /> {apt.appointment_time}
              </div>
            </div>
          );
        })}

        {/* Now indicator — only shows during an active appointment window */}
        <NowLine appointments={appointments} />
      </div>
    </div>
  );
};

const NowLine = ({ appointments }) => {
  const [nowTop, setNowTop] = useState(null);

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTotalMins = currentH * 60 + currentM;

      // Check if current time falls within any appointment's 1-hour window
      const isActive = appointments.some((apt) => {
        const [h, m] = apt.appointment_time.split(":").map(Number);
        const aptStart = h * 60 + m;
        const aptEnd = aptStart + 60; // 1 hour after
        return currentTotalMins >= aptStart && currentTotalMins <= aptEnd;
      });

      if (isActive && currentH >= 8 && currentH <= 18) {
        const top = (currentH - 8) * 80 + currentM * (80 / 60);
        setNowTop(top);
      } else {
        setNowTop(null); // Hide if not in any active window
      }
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [appointments]);

  if (nowTop === null) return null;

  return (
    <div
      className="absolute left-0 right-0 border-t-2 border-red-500 z-10 flex items-center"
      style={{ top: `${nowTop}px` }}
    >
      <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 shadow-sm shadow-red-500/50" />
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    confirmed:
      "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 border-teal-200 dark:border-teal-500/30",
    cancelled:
      "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30",
  };

  // Default to pending if no status is provided
  const normalizedStatus = status?.toLowerCase() || "pending";
  const currentStyle = styles[normalizedStatus] || styles.pending;

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${currentStyle}`}
    >
      {normalizedStatus}
    </span>
  );
};
