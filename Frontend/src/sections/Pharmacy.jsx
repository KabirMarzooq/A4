import React, { useEffect, useState } from "react";
import {
  Pill,
  Search,
  Download,
  RefreshCw,
  Calendar,
  User,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

export default function Pharmacy() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get("/patient/prescriptions");
      setPrescriptions(res.data);
    } catch (err) {
      toast.error("Could not load your prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefill = async (id) => {
    try {
      await api.post(`/patient/prescriptions/${id}/refill`);
      toast.success("Refill request sent to your doctor!");
    } catch (err) {
      toast.error("Failed to send refill request.");
    }
  };

  const handleDownload = (p) => {
    const rows = p.items?.length
      ? p.items
          .map(
            (item) => `
              <tr>
                <td>${item.drug_name}</td>
                <td>${item.quantity}</td>
                <td>${item.dosage || "—"}</td>
                <td>${item.frequency || "—"}</td>
                <td>${item.duration || "—"}</td>
              </tr>`
          )
          .join("")
      : `
        <tr>
          <td>${p.medication || "—"}</td>
          <td>—</td>
          <td>${p.dosage || "—"}</td>
          <td>${p.frequency || "—"}</td>
          <td>${p.duration || "—"}</td>
        </tr>`;

    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Prescription - ${p.medication || p.id}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',Arial,sans-serif; color:#1e293b; padding:40px; font-size:13px; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #1B7A3D; padding-bottom:16px; margin-bottom:20px; }
        .brand { font-size:22px; font-weight:900; color:#1B7A3D; }
        .sub { font-size:11px; color:#64748b; margin-top:2px; }
        .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:16px 0 20px; }
        .meta-item { background:#f8fafc; border-radius:8px; padding:10px; }
        .meta-label { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:700; }
        .meta-value { font-size:13px; font-weight:700; margin-top:2px; }
        table { width:100%; border-collapse:collapse; margin:12px 0; }
        th { background:#f8fafc; padding:10px; text-align:left; font-size:10px; text-transform:uppercase; color:#64748b; }
        td { padding:10px; border-bottom:1px solid #e2e8f0; font-size:12px; }
        .footer { margin-top:24px; padding-top:12px; border-top:1px solid #e2e8f0; font-size:10px; color:#94a3b8; text-align:center; }
        @media print { body { padding:20px; } }
      </style>
      </head><body>
        <div class="header">
          <div>
            <div class="brand">A4 Medical Consortium</div>
            <div class="sub">Official Prescription</div>
          </div>
          <div class="sub">Issued: ${p.created_at ? p.created_at.split("T")[0] : "—"}</div>
        </div>
        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">Prescribed By</div>
            <div class="meta-value">Dr. ${p.doctor?.name || "—"}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Medication</th>
              <th>Qty</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">This is an official prescription issued by A4 Medical Consortium.</div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const filtered = prescriptions.filter(
    (p) =>
      p.medication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Loading your medications...
      </div>
    );

  return (
    <div className="p-2">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          My Prescriptions
        </h2>
        <p className="text-slate-500 text-sm">
          View and manage your prescribed medications
        </p>
      </div>

      <div className="relative w-full max-w-xl mb-8">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by medication or doctor..."
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(p)}
                    className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all cursor-pointer"
                    title="Download PDF"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">
                {p.medication}
              </h3>
              <p className="text-slate-500 text-xs font-medium mb-4 flex items-center gap-1">
                <User size={12} className="text-teal-500" /> Prescribed by:{" "}
                <span className="text-slate-700 dark:text-slate-300 font-bold">
                  Dr. {p.doctor?.name}
                </span>
              </p>

              {p.items?.length > 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 mb-6 space-y-2">
                  {p.items.map((item, i) => (
                    <div
                      key={i}
                      className="border-b border-slate-100 dark:border-slate-700 last:border-0 pb-2 last:pb-0"
                    >
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
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
                          <span className="text-teal-600 dark:text-teal-400 font-medium">
                            {item.frequency}
                          </span>
                        )}
                        {item.duration && (
                          <span className="font-medium">{item.duration}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-6">
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
                      Frequency
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {p.frequency}
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
                <button
                  onClick={() => handleRefill(p.id)}
                  className="flex items-center gap-2 text-xs font-bold text-teal-500 hover:text-teal-600 transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} /> Request Refill
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
