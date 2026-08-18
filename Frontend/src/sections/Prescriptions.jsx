import React, { useEffect, useState } from "react";
import { Pill, Search, Plus, X, Calendar, User, Trash2 } from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 dark:text-white text-sm";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientFiles, setPatientFiles] = useState([]);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [drugLines, setDrugLines] = useState([
    {
      drug_id: "",
      drug_name: "",
      quantity: 1,
      unit_price: 0,
      total: 0,
      frequency: "",
      duration: "",
      dosage: "",
    },
  ]);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prescRes, patientsRes, drugsRes, filesRes] = await Promise.all([
        api.get("/doctor/prescriptions"),
        api.get("/doctor/patients"),
        api.get("/pharmacy/drugs"),
        api.get("/folders"),
      ]);
      setPrescriptions(prescRes.data);
      setPatients(patientsRes.data);
      setDrugs(drugsRes.data?.drugs || []);

      const allFiles = [];
      for (const folder of filesRes.data || []) {
        const folderRes = await api.get(`/folders/${folder.id}`);
        folderRes.data.files?.forEach((file) => {
          allFiles.push({
            ...file,
            folder_name: folder.folder_name,
            phone: folder.phone,
            display: `${file.first_name} ${file.last_name} — ${folder.folder_name}`,
          });
        });
      }
      setPatientFiles(allFiles);
    } catch {
      toast.error("Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  // Add/update a drug line
  const setDrugLine = (index, field, value) => {
    setDrugLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // If drug selected, auto-fill price and recalculate total
      if (field === "drug_id") {
        const found = drugs.find((d) => d.id === parseInt(value));
        if (found) {
          updated[index].drug_name = found.name;
          updated[index].unit_price = found.unit_price;
          updated[index].total = found.unit_price * updated[index].quantity;
        }
      }
      if (field === "quantity") {
        updated[index].total = updated[index].unit_price * parseInt(value || 0);
      }
      return updated;
    });
  };

  const addDrugLine = () =>
    setDrugLines((prev) => [
      ...prev,
      { drug_id: "", drug_name: "", quantity: 1, unit_price: 0, total: 0 },
    ]);

  const removeDrugLine = (index) =>
    setDrugLines((prev) => prev.filter((_, i) => i !== index));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return toast.error("Please select a patient.");

    const isFile = selectedPatient.startsWith("file-");
    const patientPayload = isFile
      ? { patient_file_id: selectedPatient.replace("file-", "") }
      : { patient_id: selectedPatient.replace("user-", "") };

    if (drugLines.some((l) => !l.drug_id || l.quantity < 1))
      return toast.error("Please complete all drug lines.");

    try {
      await api.post("/doctor/prescriptions", {
        ...patientPayload,
        instructions: instructions,
        drugs: drugLines.map((l) => ({
          drug_id: l.drug_id,
          drug_name: l.drug_name,
          quantity: l.quantity,
          unit_price: l.unit_price,
          total: l.total,
          frequency: l.frequency,
          duration: l.duration,
          dosage: l.dosage,
        })),
      });
      toast.success("Prescription issued!");
      setIsSidebarOpen(false);
      setSelectedPatient("");
      setDrugLines([
        { drug_id: "", drug_name: "", quantity: 1, unit_price: 0, total: 0 },
      ]);
      setInstructions("");
      fetchData();
    } catch {
      toast.error("Error issuing prescription.");
    }
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesMedication = p.medication?.toLowerCase().includes(term);
    const matchesOnlinePatient = p.patient?.name?.toLowerCase().includes(term);
    const matchesPatient = p.patient_file?.first_name?.toLowerCase().includes(term);
    const matchesItems = p.items?.some((item) =>
      item.drug_name?.toLowerCase().includes(term)
    );
    return matchesMedication || matchesPatient || matchesOnlinePatient || matchesItems;
  });

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        Syncing Pharmacy Records...
      </div>
    );

  return (
    <div className="p-2 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Prescription Management
          </h2>
          <p className="text-slate-500 text-sm">
            Review history and issue new medication
          </p>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={20} /> New Prescription
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-xl mb-8">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by patient or medication..."
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrescriptions.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-600">
                <Pill size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar size={12} /> {p.created_at?.split("T")[0]}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
              {p.items?.length > 0
                ? p.items.map((i) => i.drug_name).join(", ")
                : p.medication}
            </h3>
            <p className="text-slate-500 text-xs font-medium mb-4 flex items-center gap-1">
              <User size={12} /> Patient:{" "}
              <span className="text-teal-600">
                {p.patient?.name ||
                  (p.patient_file
                    ? `${p.patient_file.first_name} ${p.patient_file.last_name}`
                    : "Unknown")}
              </span>
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-2">
              {p.items?.length > 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 space-y-2 mb-3">
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
                          <span className="text-slate-500 font-medium">
                            {item.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 mb-3">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {p.medication}
                  </p>
                </div>
              )}

              {p.instructions && (
                <p className="text-xs text-slate-400 italic mb-3">
                  {p.instructions}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Form Sidebar */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 p-8 transform transition-transform duration-300 border-l border-slate-200 dark:border-slate-700 overflow-y-auto custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              New Prescription
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleCreate}
            className="space-y-5 overflow-y-auto custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {/* Patient */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Patient
              </label>
              <select
                className={`${inputClass} flex-1`}
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
              >
                <option value="">Select a patient</option>

                {/* Registered online patients */}
                {patients.length > 0 && (
                  <optgroup label="── Online Patients ──">
                    {patients.map((p) => (
                      <option key={`user-${p.id}`} value={`user-${p.id}`}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* Walk-in patient files */}
                {patientFiles.length > 0 && (
                  <optgroup label="── Walk-in Patients ──">
                    {patientFiles.map((f) => (
                      <option key={`file-${f.id}`} value={`file-${f.id}`}>
                        {f.display}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Drug Lines */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">
                Drugs
              </label>
              <div className="space-y-3">
                {drugLines.map((line, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    {/* Drug selector */}
                    <div className="flex gap-2 items-center">
                      <select
                        className={`${inputClass} flex-1 overflow-y-auto custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
                        value={line.drug_id}
                        onChange={(e) =>
                          setDrugLine(index, "drug_id", e.target.value)
                        }
                      >
                        <option value="">Select drug...</option>
                        {drugs.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} — ₦{Number(d.unit_price).toLocaleString()}
                          </option>
                        ))}
                      </select>
                      {drugLines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDrugLine(index)}
                          className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    {/* Qty + Price + Total */}
                    {line.drug_id && (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-slate-400 font-bold uppercase mb-1">
                            Qty
                          </p>
                          <input
                            type="number"
                            min="1"
                            className={inputClass}
                            value={line.quantity}
                            onChange={(e) =>
                              setDrugLine(index, "quantity", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold uppercase mb-1">
                            Unit Price
                          </p>
                          <p className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-medium">
                            ₦{Number(line.unit_price).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold uppercase mb-1">
                            Total
                          </p>
                          <p className="p-3 bg-teal-50 dark:bg-teal-500/10 rounded-xl text-teal-600 dark:text-teal-400 font-bold">
                            ₦{Number(line.total).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {line.drug_id && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-slate-400 font-bold uppercase text-xs mb-1">
                            Frequency
                          </p>
                          <input
                            type="text"
                            placeholder="e.g. Twice daily"
                            className={inputClass}
                            value={
                              line.frequency
                                ? line.frequency.replace(/\s*daily$/i, "")
                                : ""
                            }
                            onChange={(e) => {
                              const raw = e.target.value;
                              // If user already typed a daily/weekly/hourly variant, it will store as it is
                              const alreadyHasSuffix =
                                /\b(daily|weekly|hourly|times|twice|once)\b/i.test(
                                  raw
                                );
                              setDrugLine(
                                index,
                                "frequency",
                                raw
                                  ? alreadyHasSuffix
                                    ? raw
                                    : `${raw} daily`
                                  : ""
                              );
                            }}
                          />
                          {line.frequency && (
                            <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-1 pl-1">
                              → {line.frequency}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold uppercase text-xs mb-1">
                            Duration
                          </p>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              placeholder="e.g. 7 Days"
                              className={inputClass}
                              value={
                                line.duration
                                  ? line.duration.replace(" days", "")
                                  : ""
                              }
                              onChange={(e) =>
                                setDrugLine(
                                  index,
                                  "duration",
                                  e.target.value ? `${e.target.value} days` : ""
                                )
                              }
                            />
                            {line.duration && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-teal-600 dark:text-teal-400 font-bold pointer-events-none">
                                days
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold uppercase text-xs mb-1">
                            Dose
                          </p>
                          <input
                            type="text"
                            placeholder="e.g. 2 tablets"
                            className={inputClass}
                            value={line.dosage || ""}
                            onChange={(e) =>
                              setDrugLine(index, "dosage", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addDrugLine}
                className="mt-3 flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm font-bold hover:underline"
              >
                <Plus size={15} /> Add another drug
              </button>
            </div>

            {/* Instructions */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Special Instructions
              </label>
              <textarea
                rows="3"
                placeholder="Take after meals, avoid alcohol..."
                className={`${inputClass} resize-none`}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/25 cursor-pointer"
            >
              Issue Prescription
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
