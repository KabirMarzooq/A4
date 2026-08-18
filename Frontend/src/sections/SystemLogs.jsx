import React, { useEffect, useState } from "react";
import { Search, Calendar, Monitor } from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

const ACTION_STYLES = {
  auth: { color: "bg-blue-500/10 text-blue-500", label: "Auth" },
  user: { color: "bg-purple-500/10 text-purple-500", label: "User" },
  appointment: { color: "bg-teal-500/10 text-teal-500", label: "Appointment" },
  prescription: {
    color: "bg-amber-500/10 text-amber-500",
    label: "Prescription",
  },
  visit_record: {
    color: "bg-cyan-500/10 text-cyan-500",
    label: "Visit Record",
  },
  patient_file: {
    color: "bg-indigo-500/10 text-indigo-500",
    label: "Patient File",
  },
  patient_folder: {
    color: "bg-violet-500/10 text-violet-500",
    label: "Folder",
  },
  inventory: { color: "bg-orange-500/10 text-orange-500", label: "Inventory" },
  billing: { color: "bg-green-500/10 text-green-500", label: "Billing" },
  sales: { color: "bg-rose-500/10 text-rose-500", label: "Sales" },
};

const getActionStyle = (action) => {
  const prefix = action?.split(".")[0];
  return (
    ACTION_STYLES[prefix] || {
      color: "bg-slate-500/10 text-slate-500",
      label: "System",
    }
  );
};

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [searchTerm, actionFilter]);

  const fetchLogs = async (page = 1) => {
    try {
      const res = await api.get("/admin/logs", {
        params: { page, search: searchTerm, action: actionFilter },
      });
      setLogs(res.data.data);
      setMeta(res.data);
    } catch {
      toast.error("Failed to fetch system logs.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading System Logs...
      </div>
    );

  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            System Logs
          </h2>
          <p className="text-slate-500 text-sm">
            Full audit trail of all system activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Monitor size={16} className="text-slate-400" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            {meta.total || 0} total entries
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-2 mb-6 flex flex-col md:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search logs by description..."
            className="w-full bg-transparent py-3 pl-12 pr-4 text-slate-900 dark:text-white outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
        >
          <option value="">All Actions</option>
          <option value="auth">Auth</option>
          <option value="user">User</option>
          <option value="appointment">Appointment</option>
          <option value="prescription">Prescription</option>
          <option value="visit_record">Visit Records</option>
          <option value="patient_file">Patient Files</option>
          <option value="patient_folder">Patient Folders</option>
          <option value="inventory">Inventory</option>
          <option value="billing">Billing</option>
          <option value="sales">Sales</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                {[
                  "#",
                  "Action",
                  "Performed By",
                  "Description",
                  "IP Address",
                  "Time",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {logs.map((log, index) => {
                const style = getActionStyle(log.action);
                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                      {(meta.from + index).toString().padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border-0 ${style.color}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 text-xs font-bold">
                          {log.user?.name?.charAt(0) || "A"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {log.user?.name || "System Admin"}
                          </p>
                          <p className="text-[10px] text-slate-400 capitalize">
                            {log.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {log.ip_address || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-teal-500 font-bold">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/30">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="text-slate-900 dark:text-white font-bold">
              {meta.from}
            </span>{" "}
            to{" "}
            <span className="text-slate-900 dark:text-white font-bold">
              {meta.to}
            </span>{" "}
            of {meta.total} logs
          </p>
          <div className="flex gap-2">
            <button
              disabled={!meta.prev_page_url}
              onClick={() => fetchLogs(meta.current_page - 1)}
              className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={!meta.next_page_url}
              onClick={() => fetchLogs(meta.current_page + 1)}
              className="px-4 py-2 text-xs font-bold bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
