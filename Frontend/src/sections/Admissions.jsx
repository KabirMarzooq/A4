import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BedDouble, ChevronRight, Calendar } from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// Whole days elapsed since admission, counting the admission day as day 1 —
// matches how the ward talks about a stay ("day 3"), not a raw diff.
const stayDays = (admissionDate) => {
  if (!admissionDate) return null;
  const diff = Date.now() - new Date(admissionDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

export default function Admissions() {
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("admitted");

  useEffect(() => {
    const timer = setTimeout(() => fetchAdmissions(), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  const fetchAdmissions = async (page = 1) => {
    try {
      const res = await api.get("/admissions", {
        params: { page, search: searchTerm, status: statusFilter || undefined },
      });
      setAdmissions(res.data.data || []);
      setMeta(res.data);
    } catch {
      toast.error("Failed to load admissions.");
    } finally {
      setLoading(false);
    }
  };

  const currentCount = admissions.filter(
    (a) => a.status === "admitted"
  ).length;

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading admissions...
      </div>
    );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Admissions
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Patients currently on the ward and past stays
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by patient name..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {[
            { id: "admitted", label: "On Ward" },
            { id: "discharged", label: "Discharged" },
            { id: "", label: "All" },
          ].map((f) => (
            <button
              key={f.id || "all"}
              onClick={() => setStatusFilter(f.id)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                statusFilter === f.id
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {statusFilter === "admitted" && admissions.length > 0 && (
        <p className="text-sm text-slate-500 mb-4">
          <span className="font-bold text-teal-600 dark:text-teal-400">
            {currentCount}
          </span>{" "}
          patient{currentCount === 1 ? "" : "s"} currently admitted
        </p>
      )}

      {admissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BedDouble
            size={40}
            className="text-slate-300 dark:text-slate-600 mb-4"
          />
          <p className="text-slate-500 font-medium">
            {statusFilter === "admitted"
              ? "No patients currently admitted"
              : "No admissions found"}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Patients are admitted from their file in Medical Records.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {admissions.map((a) => {
            const isCurrent = a.status === "admitted";
            const days = stayDays(a.admission_date);
            return (
              <button
                key={a.id}
                onClick={() =>
                  navigate(
                    `/dashboard/medical-records?file=${a.patient_file?.id}`
                  )
                }
                className={`w-full text-left bg-white dark:bg-slate-800 border rounded-3xl p-5 hover:shadow-md transition-all cursor-pointer ${
                  isCurrent
                    ? "border-teal-300 dark:border-teal-500/40"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isCurrent
                          ? "bg-teal-500/10 text-teal-500"
                          : "bg-slate-500/10 text-slate-400"
                      }`}
                    >
                      <BedDouble size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {a.patient_file
                            ? `${a.patient_file.first_name} ${a.patient_file.last_name}`
                            : "Unknown patient"}
                        </p>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            isCurrent
                              ? "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 border-teal-200 dark:border-teal-500/30"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                          }`}
                        >
                          {isCurrent ? "On Ward" : "Discharged"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="font-semibold">Ward: {a.ward}</span>
                        {a.patient_file?.folder?.folder_name && (
                          <span>{a.patient_file.folder.folder_name}</span>
                        )}
                        {a.admitting_doctor?.name && (
                          <span>Dr. {a.admitting_doctor.name}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {formatDate(a.admission_date)}
                          {!isCurrent && a.discharge_date
                            ? ` → ${formatDate(a.discharge_date)}`
                            : ""}
                        </span>
                      </div>
                      {a.reason_for_admission && (
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">
                          {a.reason_for_admission}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:justify-end">
                    {isCurrent && days && (
                      <div className="text-right">
                        <p className="text-2xl font-black text-teal-600 dark:text-teal-400 leading-none">
                          {days}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                          Day{days === 1 ? "" : "s"}
                        </p>
                      </div>
                    )}
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-500">
            Page {meta.current_page} of {meta.last_page}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchAdmissions(meta.current_page - 1)}
              disabled={meta.current_page <= 1}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => fetchAdmissions(meta.current_page + 1)}
              disabled={meta.current_page >= meta.last_page}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-teal-500 text-white disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
