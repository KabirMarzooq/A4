import React, { useEffect, useState } from "react";
import { Pill, Search, User, Calendar, Stethoscope, Download } from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { printPrescription } from "../utils/printPrescription";

export default function AllPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get("/prescriptions");
      setPrescriptions(res.data?.data || res.data);
    } catch {
      toast.error("Could not load prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = prescriptions.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesMedication = p.medication?.toLowerCase().includes(term);
    const matchesDoctor = p.doctor?.name?.toLowerCase().includes(term);
    const matchesOnlinePatient = p.patient?.name?.toLowerCase().includes(term);
    const matchesPatient = p.patient_file?.first_name?.toLowerCase().includes(term);
    const matchesItems = p.items?.some((item) =>
      item.drug_name?.toLowerCase().includes(term)
    );
    return matchesMedication || matchesDoctor || matchesPatient || matchesOnlinePatient || matchesItems;
  });

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading prescriptions...
      </div>
    );

  return (
    <div className="p-2">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          All Prescriptions
        </h2>
        <p className="text-slate-500 text-sm">
          System-wide view of all issued prescriptions
        </p>
      </div>

      <div className="relative w-full max-w-xl mb-8">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by medication, doctor or patient..."
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <Pill className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-medium">No prescriptions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                  <Pill size={24} />
                </div>
                <button
                  onClick={() => printPrescription(p)}
                  className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all cursor-pointer"
                  title="Print / Download"
                >
                  <Download size={18} />
                </button>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-3">
                {p.medication}
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <User size={13} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    Patient
                  </p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {p.patient?.name ||
                      (p.patient_file
                        ? `${p.patient_file.first_name} ${p.patient_file.last_name}`
                        : "Unknown")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Stethoscope size={13} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    Doctor
                  </p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Dr. {p.doctor?.name || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Drug items or medication summary */}
              {p.items?.length > 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 mb-5 space-y-2">
                  {p.items.map((item, i) => (
                    <div
                      key={i}
                      className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-2 last:pb-0"
                    >
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {item.drug_name}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                        <span>Qty: {item.quantity}</span>
                        {item.dosage && (
                          <span className="text-teal-600 dark:text-teal-400 font-medium">
                            {item.dosage}
                          </span>
                        )}
                        {item.frequency && (
                          <span className="text-teal-600 font-medium">
                            {item.frequency}
                          </span>
                        )}
                        {item.duration && (
                          <span className="text-slate-500 font-medium">
                            {item.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Dosage
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {p.dosage}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Duration
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {p.duration}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
                  <Calendar size={12} /> {p.created_at?.split("T")[0]}
                </div>
                <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">
                  #{p.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
