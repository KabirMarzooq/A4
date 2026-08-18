import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Search,
  ArrowLeft,
  ArrowLeftRight,
  User,
  Phone,
  MapPin,
  Calendar,
  Stethoscope,
  Activity,
  Thermometer,
  Heart,
  Wind,
  Droplets,
  ShieldAlert,
  AlertTriangle,
  X,
  Pencil,
  ChevronRight,
  ClipboardList,
  Microscope,
  FlaskConical,
  BadgeDollarSign,
  Pill,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 text-sm";

const formatNGN = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

// ── LEVEL 1: FOLDER LIST ──────────────────────────────────────────────────────
export default function MedicalRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(
    searchParams.get("folderId") ? Number(searchParams.get("folderId")) : null
  ); // → go to level 2
  const [selectedFile, setSelectedFile] = useState(
    searchParams.get("fileId") ? Number(searchParams.get("fileId")) : null
  ); // → go to level 3

  // Deep-linked in from elsewhere (e.g. the "Transferred to you" widget) —
  // jump straight to the file/folder once, then drop the params so normal
  // back-navigation within this page works as usual.
  useEffect(() => {
    if (searchParams.get("folderId") || searchParams.get("fileId")) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFolders = async (search = "") => {
    try {
      const res = await api.get("/folders", { params: { search } });
      setFolders(res.data);
    } catch {
      toast.error("Failed to load folders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchFolders(searchTerm), 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Navigate to file view
  if (selectedFile) {
    return (
      <PatientFileView
        fileId={selectedFile}
        onBack={() => setSelectedFile(null)}
      />
    );
  }

  // Navigate to folder view
  if (selectedFolder) {
    return (
      <FolderView
        folderId={selectedFolder}
        onBack={() => setSelectedFolder(null)}
        onSelectFile={setSelectedFile}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Medical Records
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Search by family name or phone number
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={18} /> New Folder
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-xl mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by family name or phone..."
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Folders Grid */}
      {loading ? (
        <div className="text-slate-400 animate-pulse">Loading folders...</div>
      ) : folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Folder
            size={48}
            className="text-slate-300 dark:text-slate-600 mb-4"
          />
          <p className="text-slate-500 font-medium text-lg">No folders yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Click "New Folder" to create the first family folder.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 flex items-center gap-4 hover:shadow-md hover:border-teal-300 dark:hover:border-teal-600 transition-all text-left group cursor-pointer"
            >
              <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-500/20 transition-colors">
                <FolderOpen size={26} className="text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {folder.folder_name}
                </p>
                {folder.card_number && (
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-bold mt-0.5">
                    {folder.card_number}
                  </p>
                )}
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone size={10} /> {folder.phone}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {folder.files_count}{" "}
                  {folder.files_count === 1 ? "member" : "members"}
                </p>
              </div>
              <ChevronRight
                size={18}
                className="text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0"
              />
            </button>
          ))}
        </div>
      )}

      {/* New Folder Form */}
      <FolderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={() => {
          fetchFolders(searchTerm);
          setIsFormOpen(false);
        }}
      />
    </div>
  );
}

// ── LEVEL 2: FOLDER VIEW (family members) ─────────────────────────────────────
function FolderView({ folderId, onBack, onSelectFile }) {
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFileFormOpen, setIsFileFormOpen] = useState(false);
  const [isFolderFormOpen, setIsFolderFormOpen] = useState(false);

  const fetchFolder = async () => {
    try {
      const res = await api.get(`/folders/${folderId}`);
      setFolder(res.data);
    } catch {
      toast.error("Failed to load folder.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolder();
  }, [folderId]);

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">Opening folder...</div>
    );

  return (
    <div className="p-6">
      {/* Back + header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors text-sm font-medium mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} /> All Folders
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center">
            <FolderOpen size={26} className="text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {folder.folder_name}
              </h2>
              {folder.card_number && (
                <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg text-[10px] font-bold font-mono">
                  {folder.card_number}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Phone size={12} /> {folder.phone}
              </span>
              {folder.address && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {folder.address}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsFolderFormOpen(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
          >
            <Pencil size={16} /> Edit Folder
          </button>
          <button
            onClick={() => setIsFileFormOpen(true)}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Add Member
          </button>
        </div>
      </div>

      {/* Member files */}
      {folder.files?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText
            size={40}
            className="text-slate-300 dark:text-slate-600 mb-4"
          />
          <p className="text-slate-500 font-medium">No members yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Click "Add Member" to create the first patient file.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folder.files?.map((file) => (
            <button
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 flex items-center gap-4 hover:shadow-md hover:border-teal-300 dark:hover:border-teal-600 transition-all text-left group cursor-pointer"
            >
              <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center font-bold text-white text-lg uppercase flex-shrink-0">
                {file.first_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {file.full_name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {file.gender}
                  {file.date_of_birth
                    ? ` · ${calcAge(file.date_of_birth)} yrs`
                    : ""}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {file.visit_records_count || 0} visit
                  {(file.visit_records_count || 0) !== 1 ? "s" : ""}
                </p>
              </div>
              <ChevronRight
                size={18}
                className="text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0"
              />
            </button>
          ))}
        </div>
      )}

      {/* Add member form */}
      <PatientFileForm
        isOpen={isFileFormOpen}
        onClose={() => setIsFileFormOpen(false)}
        folderId={folderId}
        onSaved={() => {
          fetchFolder();
          setIsFileFormOpen(false);
        }}
      />

      {/* Edit folder form */}
      <FolderForm
        isOpen={isFolderFormOpen}
        onClose={() => setIsFolderFormOpen(false)}
        editingFolder={folder}
        onSaved={() => {
          fetchFolder();
          setIsFolderFormOpen(false);
        }}
      />
    </div>
  );
}

// ── LEVEL 3: PATIENT FILE VIEW ────────────────────────────────────────────────
function PatientFileView({ fileId, onBack }) {
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [prescriptions, setPrescriptions] = useState([]);
  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isEditFileOpen, setIsEditFileOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const fetchFile = async () => {
    try {
      const [fileRes, prescRes] = await Promise.all([
        api.get(`/folders/files/${fileId}`),
        api.get(`/folders/files/${fileId}/prescriptions`),
      ]);
      setFile(fileRes.data);
      setPrescriptions(prescRes.data || []);
    } catch {
      toast.error("Failed to load patient file.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFile();
  }, [fileId]);

  if (loading)
    return (
      <div className="p-6 text-slate-400 animate-pulse">Opening file...</div>
    );

  const profile = file;
  const records = file?.visit_records || [];

  const tabs = [
    { id: "overview", label: "Overview", icon: <ClipboardList size={15} /> },
    {
      id: "prescriptions",
      label: "Prescriptions",
      icon: <Pill size={15} />,
      count: prescriptions.length,
    },
  ];

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors text-sm font-medium mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} /> {file?.folder?.folder_name}
      </button>

      {/* Patient header card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm mb-6">
        {/* Name + action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center font-bold text-white text-2xl uppercase">
              {file?.first_name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {file?.full_name}
              </h2>
              <p className="text-slate-500 text-sm">
                {file?.folder?.folder_name} ·{" "}
                <span className="font-mono">{file?.folder?.phone}</span>
              </p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                File #{String(file?.id).padStart(4, "0")}
                {file?.folder?.card_number
                  ? ` · Card ${file.folder.card_number}`
                  : ""}
              </p>
              <p className="text-xs font-semibold mt-1 flex items-center gap-1">
                {file?.current_doctor ? (
                  <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <Stethoscope size={12} /> Assigned to Dr.{" "}
                    {file.current_doctor.name}
                    {file.current_doctor.specialization
                      ? ` · ${file.current_doctor.specialization}`
                      : ""}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle size={12} /> Not yet assigned to a doctor
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsTransferOpen(true)}
              className="flex items-center gap-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeftRight size={16} />{" "}
              {file?.current_doctor ? "Transfer" : "Assign Doctor"}
            </button>
            <button
              onClick={() => setIsEditFileOpen(true)}
              className="flex items-center gap-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
            >
              <Pencil size={16} /> Edit Profile
            </button>
            <button
              onClick={() => setIsVisitFormOpen(true)}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> Add Visit Record
            </button>
          </div>
        </div>

        {/* Critical alerts */}
        {(profile?.allergies || profile?.chronic_conditions) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {profile?.allergies && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-4">
                <ShieldAlert
                  size={18}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">
                    Allergies
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {profile.allergies}
                  </p>
                </div>
              </div>
            )}
            {profile?.chronic_conditions && (
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4">
                <AlertTriangle
                  size={18}
                  className="text-amber-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                    Chronic Conditions
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {profile.chronic_conditions}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            {
              icon: <Droplets size={13} />,
              label: "Blood Type",
              value: profile?.blood_type || "—",
              color: "text-red-500",
            },
            {
              icon: <User size={13} />,
              label: "Gender",
              value: profile?.gender || "—",
              color: "text-blue-500",
            },
            {
              icon: <Calendar size={13} />,
              label: "Age",
              value: profile?.date_of_birth
                ? `${calcAge(profile.date_of_birth)} yrs`
                : "—",
              color: "text-purple-500",
            },
            {
              icon: <Activity size={13} />,
              label: "Height(cm)",
              value: profile?.height_cm || "—",
              color: "text-teal-500",
            },
            {
              icon: <Activity size={13} />,
              label: "Weight(kg)",
              value: profile?.weight_kg || "—",
              color: "text-teal-500",
            },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-100 dark:border-slate-700"
            >
              <div
                className={`flex items-center gap-1 ${m.color} text-[10px] font-bold uppercase tracking-wider mb-1`}
              >
                {m.icon} {m.label}
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal & next of kin details — only shown once something's filled in */}
      {(profile?.email ||
        profile?.place_of_origin ||
        profile?.tribe ||
        profile?.occupation ||
        profile?.religion ||
        profile?.marital_status ||
        profile?.lab_ref_no ||
        profile?.blood_group ||
        profile?.rhesus ||
        profile?.genotype ||
        profile?.sensitivity ||
        profile?.next_of_kin_name) && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            Personal & Next of Kin Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
            <DetailItem label="Email" value={profile?.email} />
            <DetailItem label="Marital Status" value={profile?.marital_status} />
            <DetailItem label="Place of Origin" value={profile?.place_of_origin} />
            <DetailItem label="Tribe" value={profile?.tribe} />
            <DetailItem label="Occupation" value={profile?.occupation} />
            <DetailItem label="Religion" value={profile?.religion} />
            <DetailItem label="Lab Ref No" value={profile?.lab_ref_no} />
            <DetailItem label="Group" value={profile?.blood_group} />
            <DetailItem label="Rhesus" value={profile?.rhesus} />
            <DetailItem label="Genotype" value={profile?.genotype} />
            <DetailItem label="Sensitivity" value={profile?.sensitivity} />
            <DetailItem
              label="Blood Test Date"
              value={
                profile?.blood_test_date
                  ? new Date(profile.blood_test_date).toLocaleDateString()
                  : null
              }
            />
            <DetailItem label="Next of Kin" value={profile?.next_of_kin_name} />
            <DetailItem
              label="Relationship"
              value={profile?.next_of_kin_relationship}
            />
            <DetailItem
              label="Next of Kin's Phone"
              value={profile?.next_of_kin_phone}
            />
            <DetailItem
              label="Next of Kin's Email"
              value={profile?.next_of_kin_email}
            />
            <DetailItem
              label="Address of Next of Kin"
              value={profile?.next_of_kin_address}
              wide
            />
          </div>
        </div>
      )}

      {/* Visit records timeline */}
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
        Visit History ({records.length})
      </h3>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-0 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-800 text-teal-600 border border-b-white dark:border-slate-700 dark:border-b-slate-800 -mb-px"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className="bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ClipboardList
                size={40}
                className="text-slate-300 dark:text-slate-600 mb-4"
              />
              <p className="text-slate-500 font-medium">No visit records yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Click "Add Visit Record" to log the first encounter.
              </p>
            </div>
          ) : (
            <div className="relative space-y-0">
              <div className="absolute left-6 top-6 bottom-6 w-px bg-slate-200 dark:bg-slate-700" />
              {records.map((record) => (
                <div key={record.id} className="relative flex gap-6 pb-6">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 border-2 border-teal-500 rounded-2xl flex items-center justify-center shadow-sm">
                      <Stethoscope size={18} className="text-teal-500" />
                    </div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm">
                    {/* Date + doctor */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                      <p className="font-bold text-teal-600 dark:text-teal-400">
                        {new Date(record.visit_date).toLocaleDateString(
                          "en-NG",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-slate-400">
                          {record.doctor?.role?.toLowerCase() === "doctor"
                            ? "Dr. "
                            : ""}
                          {record.doctor?.name}
                          {record.doctor?.specialization
                            ? ` · ${record.doctor.specialization}`
                            : ""}
                        </p>
                        <button
                          onClick={() => setEditingRecord(record)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                      </div>
                    </div>

                    {/* Chief complaint */}
                    <div className="bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 rounded-2xl px-4 py-3 mb-4">
                      <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
                        Chief Complaint
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {record.chief_complaint}
                      </p>
                    </div>

                    {/* Vitals */}
                    {(record.blood_pressure ||
                      record.temperature_c ||
                      record.heart_rate ||
                      record.oxygen_saturation) && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {record.blood_pressure && (
                          <VitalChip
                            icon={<Activity size={11} />}
                            label="BP"
                            value={record.blood_pressure}
                            color="text-red-500"
                          />
                        )}
                        {record.temperature_c && (
                          <VitalChip
                            icon={<Thermometer size={11} />}
                            label="Temp"
                            value={`${record.temperature_c}°C`}
                            color="text-orange-500"
                          />
                        )}
                        {record.heart_rate && (
                          <VitalChip
                            icon={<Heart size={11} />}
                            label="Heart Rate"
                            value={`${record.heart_rate} bpm`}
                            color="text-pink-500"
                          />
                        )}
                        {record.oxygen_saturation && (
                          <VitalChip
                            icon={<Wind size={11} />}
                            label="SpO2"
                            value={`${record.oxygen_saturation}%`}
                            color="text-blue-500"
                          />
                        )}
                      </div>
                    )}

                    {/* Clinical fields */}
                    <div className="space-y-3">
                      {record.physical_examination && (
                        <ClinicalField
                          icon={<User size={13} />}
                          label="Physical Examination"
                          value={record.physical_examination}
                        />
                      )}
                      {record.investigation && (
                        <ClinicalField
                          icon={<Microscope size={13} />}
                          label="Investigation"
                          value={record.investigation}
                        />
                      )}
                      {record.test_results && (
                        <ClinicalField
                          icon={<FlaskConical size={13} />}
                          label="Test Results"
                          value={record.test_results}
                        />
                      )}
                      {record.diagnosis && (
                        <ClinicalField
                          icon={<ClipboardList size={13} />}
                          label="Diagnosis"
                          value={record.diagnosis}
                        />
                      )}
                      {record.notes && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Notes
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                            {record.notes}
                          </p>
                        </div>
                      )}
                      {record.action_taken && (
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl px-3 py-2">
                          <ClipboardList size={13} className="text-teal-500" />
                          <span className="text-xs text-slate-600 dark:text-slate-300">
                            <span className="font-bold">Action:</span>{" "}
                            {record.action_taken}
                          </span>
                        </div>
                      )}
                      {record.consultation_fee && (
                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl px-3 py-2">
                          <BadgeDollarSign
                            size={13}
                            className="text-green-600"
                          />
                          <span className="text-xs text-green-700 dark:text-green-400 font-bold">
                            Hospital Bill: {formatNGN(record.consultation_fee)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Edit Patient File Form */}
              <PatientFileForm
                isOpen={isEditFileOpen}
                onClose={() => setIsEditFileOpen(false)}
                folderId={file?.patient_folder_id}
                editingFile={file}
                onSaved={() => {
                  fetchFile();
                  setIsEditFileOpen(false);
                }}
              />

              {/* Edit Visit Record Form */}
              <VisitRecordForm
                isOpen={!!editingRecord}
                onClose={() => setEditingRecord(null)}
                fileId={fileId}
                patientName={file?.full_name}
                editingRecord={editingRecord}
                onSaved={() => {
                  fetchFile();
                  setEditingRecord(null);
                }}
              />
            </div>
          )}
        </>
      )}

      {activeTab === "prescriptions" && (
        <PrescriptionsTab prescriptions={prescriptions} />
      )}

      {/* Visit record form */}
      <VisitRecordForm
        isOpen={isVisitFormOpen}
        onClose={() => setIsVisitFormOpen(false)}
        fileId={fileId}
        patientName={file?.full_name}
        onSaved={() => {
          fetchFile();
          setIsVisitFormOpen(false);
        }}
      />

      {/* Transfer / assign doctor */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        fileId={fileId}
        patientName={file?.full_name}
        currentDoctorName={file?.current_doctor?.name}
        onSaved={() => {
          fetchFile();
          setIsTransferOpen(false);
        }}
      />
    </div>
  );
}

// ── PRESCRIPTIONS TAB ─────────────────────────────────────────────────────────
function PrescriptionsTab({ prescriptions }) {
  if (prescriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Pill size={28} className="text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-slate-500 font-medium">No prescriptions yet</p>
        <p className="text-slate-400 text-sm mt-1">
          Prescriptions issued by doctors will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {prescriptions.map((p) => (
        <div
          key={p.id}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-600">
              <Pill size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {p.created_at?.split("T")[0]}
            </span>
          </div>

          {/* Drug items */}
          {p.items?.length > 0 ? (
            <div className="space-y-2 mb-3">
              {p.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700"
                >
                  <p className="font-bold text-slate-800 dark:text-white text-sm">
                    {item.drug_name}
                  </p>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1">
                    <span>Qty: {item.quantity}</span>
                    {item.dosage && <span>{item.dosage}</span>}
                    {item.frequency && <span>{item.frequency}</span>}
                    {item.duration && <span>{item.duration}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-bold text-slate-800 dark:text-white text-sm mb-3">
              {p.medication}
            </p>
          )}

          {p.instructions && (
            <p className="text-xs text-slate-400 italic border-t border-slate-100 dark:border-slate-700 pt-2">
              {p.instructions}
            </p>
          )}

          <p className="text-xs text-slate-400 mt-2">Dr. {p.doctor?.name}</p>
        </div>
      ))}
    </div>
  );
}

// ── TRANSFER / ASSIGN DOCTOR MODAL ────────────────────────────────────────────
function TransferModal({
  isOpen,
  onClose,
  fileId,
  patientName,
  currentDoctorName,
  onSaved,
}) {
  const [doctors, setDoctors] = useState([]);
  const [toDoctorId, setToDoctorId] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api
      .get("/doctors")
      .then((res) => setDoctors(res.data || []))
      .catch(() => toast.error("Failed to load doctors."));
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!toDoctorId) return toast.error("Select a doctor.");
    setSaving(true);
    try {
      await api.post(`/folders/files/${fileId}/transfer`, {
        to_doctor_id: toDoctorId,
        reason,
      });
      toast.success("Patient assigned.");
      setToDoctorId("");
      setReason("");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign doctor.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

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
              {currentDoctorName ? "Transfer Patient" : "Assign a Doctor"}
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">
              Patient:{" "}
              <span className="font-bold text-teal-600">{patientName}</span>
              {currentDoctorName && (
                <>
                  {" "}
                  · Currently:{" "}
                  <span className="font-semibold">
                    Dr. {currentDoctorName}
                  </span>
                </>
              )}
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
          <FormField label="Assign to Doctor *">
            <select
              className={inputClass}
              value={toDoctorId}
              onChange={(e) => setToDoctorId(e.target.value)}
            >
              <option value="">Select a doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.name}
                  {d.specialization ? ` — ${d.specialization}` : ""}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Reason (optional)">
            <input
              type="text"
              placeholder="e.g. Dr. Adeyemi unavailable, handing off"
              className={inputClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </FormField>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all cursor-pointer"
          >
            {saving ? "Assigning..." : "Assign Doctor"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── FOLDER FORM ───────────────────────────────────────────────────────────────
function FolderForm({ isOpen, onClose, editingFolder, onSaved }) {
  const [form, setForm] = useState({ folder_name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  useEffect(() => {
    if (editingFolder) {
      setForm({
        folder_name: editingFolder.folder_name || "",
        phone: editingFolder.phone || "",
        address: editingFolder.address || "",
      });
    } else {
      setForm({ folder_name: "", phone: "", address: "" });
    }
  }, [editingFolder, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.folder_name || !form.phone)
      return toast.error("Name and phone are required.");
    setSaving(true);
    try {
      if (editingFolder) {
        await api.patch(`/folders/${editingFolder.id}`, form);
        toast.success("Folder updated.");
      } else {
        await api.post("/folders", form);
        toast.success("Folder created.");
        setForm({ folder_name: "", phone: "", address: "" });
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save folder.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

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
              {editingFolder ? "Edit Family Folder" : "New Family Folder"}
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">
              {editingFolder
                ? "Fix a mistake made when registering this family"
                : "Create a folder for a family or individual"}
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
          <FormField label="Family / Folder Name *">
            <input
              type="text"
              placeholder="e.g. Johnson Family"
              className={inputClass}
              value={form.folder_name}
              onChange={(e) => set("folder_name", e.target.value)}
            />
          </FormField>
          <FormField label="Phone Number *">
            <input
              type="text"
              placeholder="e.g. 08012345678"
              className={inputClass}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </FormField>
          <FormField label="Address (optional)">
            <input
              type="text"
              placeholder="Home address"
              className={inputClass}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </FormField>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all cursor-pointer"
          >
            {saving
              ? "Saving..."
              : editingFolder
              ? "Save Changes"
              : "Create Folder"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── PATIENT FILE FORM ─────────────────────────────────────────────────────────
const EMPTY_PATIENT_FILE_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  place_of_origin: "",
  tribe: "",
  occupation: "",
  religion: "",
  marital_status: "",
  date_of_birth: "",
  gender: "",
  blood_type: "",
  allergies: "",
  chronic_conditions: "",
  height_cm: "",
  weight_kg: "",
  lab_ref_no: "",
  blood_group: "",
  rhesus: "",
  genotype: "",
  sensitivity: "",
  blood_test_date: "",
  next_of_kin_name: "",
  next_of_kin_relationship: "",
  next_of_kin_phone: "",
  next_of_kin_address: "",
  next_of_kin_email: "",
};

function PatientFileForm({ isOpen, onClose, folderId, editingFile, onSaved }) {
  const [form, setForm] = useState(EMPTY_PATIENT_FILE_FORM);

  useEffect(() => {
    if (editingFile) {
      const next = { ...EMPTY_PATIENT_FILE_FORM };
      for (const key of Object.keys(EMPTY_PATIENT_FILE_FORM)) {
        const value = editingFile[key];
        next[key] =
          key === "date_of_birth" || key === "blood_test_date"
            ? value?.split("T")[0] || ""
            : value ?? "";
      }
      setForm(next);
    } else {
      setForm(EMPTY_PATIENT_FILE_FORM);
    }
  }, [editingFile, isOpen]);

  const [saving, setSaving] = useState(false);
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name)
      return toast.error("First and last name are required.");
    setSaving(true);
    try {
      if (editingFile) {
        await api.patch(`/folders/files/${editingFile.id}`, form);
        toast.success("Patient file updated.");
      } else {
        await api.post(`/folders/${folderId}/files`, form);
        toast.success("Patient file created.");
      }
      setForm(EMPTY_PATIENT_FILE_FORM);
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create file.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingFile ? "Edit Patient File" : "New Patient File"}
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">
              {editingFile
                ? "Update patient information"
                : "Add a family member to this folder"}
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
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First Name *">
              <input
                type="text"
                placeholder="First name"
                className={inputClass}
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
              />
            </FormField>
            <FormField label="Last Name *">
              <input
                type="text"
                placeholder="Last name"
                className={inputClass}
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date of Birth">
              <input
                type="date"
                className={inputClass}
                value={form.date_of_birth}
                onChange={(e) => set("date_of_birth", e.target.value)}
              />
            </FormField>
            <FormField label="Gender">
              <select
                className={inputClass}
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Blood Type">
              <select
                className={inputClass}
                value={form.blood_type}
                onChange={(e) => set("blood_type", e.target.value)}
              >
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Height(cm)">
              <input
                type="number"
                placeholder="175"
                className={inputClass}
                value={form.height_cm}
                onChange={(e) => set("height_cm", e.target.value)}
              />
            </FormField>
            <FormField label="Weight(kg)">
              <input
                type="number"
                placeholder="70"
                className={inputClass}
                value={form.weight_kg}
                onChange={(e) => set("weight_kg", e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Allergies">
            <input
              type="text"
              placeholder="e.g. Penicillin, Peanuts"
              className={inputClass}
              value={form.allergies}
              onChange={(e) => set("allergies", e.target.value)}
            />
          </FormField>
          <FormField label="Chronic Conditions">
            <input
              type="text"
              placeholder="e.g. Diabetes, Hypertension"
              className={inputClass}
              value={form.chronic_conditions}
              onChange={(e) => set("chronic_conditions", e.target.value)}
            />
          </FormField>

          <hr className="border-slate-100 dark:border-slate-700" />

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Personal Details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email Address">
              <input
                type="email"
                placeholder="patient@example.com"
                className={inputClass}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </FormField>
            <FormField label="Marital Status">
              <select
                className={inputClass}
                value={form.marital_status}
                onChange={(e) => set("marital_status", e.target.value)}
              >
                <option value="">Select</option>
                <option>Single</option>
                <option>Married</option>
                <option>Divorced</option>
                <option>Widowed</option>
              </select>
            </FormField>
            <FormField label="Place of Origin">
              <input
                type="text"
                className={inputClass}
                value={form.place_of_origin}
                onChange={(e) => set("place_of_origin", e.target.value)}
              />
            </FormField>
            <FormField label="Tribe">
              <input
                type="text"
                className={inputClass}
                value={form.tribe}
                onChange={(e) => set("tribe", e.target.value)}
              />
            </FormField>
            <FormField label="Occupation">
              <input
                type="text"
                className={inputClass}
                value={form.occupation}
                onChange={(e) => set("occupation", e.target.value)}
              />
            </FormField>
            <FormField label="Religion">
              <input
                type="text"
                className={inputClass}
                value={form.religion}
                onChange={(e) => set("religion", e.target.value)}
              />
            </FormField>
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Blood & Lab Record
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Lab Ref No">
              <input
                type="text"
                className={inputClass}
                value={form.lab_ref_no}
                onChange={(e) => set("lab_ref_no", e.target.value)}
              />
            </FormField>
            <FormField label="Group">
              <select
                className={inputClass}
                value={form.blood_group}
                onChange={(e) => set("blood_group", e.target.value)}
              >
                <option value="">Select</option>
                {["A", "B", "AB", "O"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Rhesus">
              <select
                className={inputClass}
                value={form.rhesus}
                onChange={(e) => set("rhesus", e.target.value)}
              >
                <option value="">Select</option>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
              </select>
            </FormField>
            <FormField label="Genotype">
              <input
                type="text"
                placeholder="e.g. AA, AS, SS"
                className={inputClass}
                value={form.genotype}
                onChange={(e) => set("genotype", e.target.value)}
              />
            </FormField>
            <FormField label="Sensitivity">
              <input
                type="text"
                className={inputClass}
                value={form.sensitivity}
                onChange={(e) => set("sensitivity", e.target.value)}
              />
            </FormField>
            <FormField label="Date">
              <input
                type="date"
                className={inputClass}
                value={form.blood_test_date}
                onChange={(e) => set("blood_test_date", e.target.value)}
              />
            </FormField>
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Next of Kin
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Name of Next of Kin">
              <input
                type="text"
                className={inputClass}
                value={form.next_of_kin_name}
                onChange={(e) => set("next_of_kin_name", e.target.value)}
              />
            </FormField>
            <FormField label="Relationship">
              <input
                type="text"
                placeholder="e.g. Spouse, Parent"
                className={inputClass}
                value={form.next_of_kin_relationship}
                onChange={(e) => set("next_of_kin_relationship", e.target.value)}
              />
            </FormField>
            <FormField label="Next of Kin's Phone No">
              <input
                type="text"
                className={inputClass}
                value={form.next_of_kin_phone}
                onChange={(e) => set("next_of_kin_phone", e.target.value)}
              />
            </FormField>
            <FormField label="Next of Kin's Email Address">
              <input
                type="email"
                className={inputClass}
                value={form.next_of_kin_email}
                onChange={(e) => set("next_of_kin_email", e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Address of Next of Kin">
            <input
              type="text"
              className={inputClass}
              value={form.next_of_kin_address}
              onChange={(e) => set("next_of_kin_address", e.target.value)}
            />
          </FormField>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all cursor-pointer"
          >
            {saving
              ? "Saving..."
              : editingFile
              ? "Save Changes"
              : "Create Patient File"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── VISIT RECORD FORM (large modal) ───────────────────────────────────────────
function VisitRecordForm({
  isOpen,
  onClose,
  fileId,
  patientName,
  editingRecord,
  onSaved,
}) {
  const [form, setForm] = useState({
    visit_date: new Date().toISOString().split("T")[0],
    chief_complaint: "",
    physical_examination: "",
    investigation: "",
    test_results: "",
    blood_pressure: "",
    temperature_c: "",
    heart_rate: "",
    oxygen_saturation: "",
    diagnosis: "",
    notes: "",
    action_taken: "",
    consultation_fee: "",
  });

  useEffect(() => {
    if (editingRecord) {
      setForm({
        visit_date:
          editingRecord.visit_date?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        chief_complaint: editingRecord.chief_complaint || "",
        physical_examination: editingRecord.physical_examination || "",
        investigation: editingRecord.investigation || "",
        test_results: editingRecord.test_results || "",
        blood_pressure: editingRecord.blood_pressure || "",
        temperature_c: editingRecord.temperature_c || "",
        heart_rate: editingRecord.heart_rate || "",
        oxygen_saturation: editingRecord.oxygen_saturation || "",
        diagnosis: editingRecord.diagnosis || "",
        notes: editingRecord.notes || "",
        action_taken: editingRecord.action_taken || "",
        consultation_fee: editingRecord.consultation_fee || "",
      });
    }
  }, [editingRecord, isOpen]);

  const [saving, setSaving] = useState(false);
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.chief_complaint)
      return toast.error("Chief complaint is required.");
    setSaving(true);
    try {
      // Replace the edit branch in handleSubmit:
      if (editingRecord) {
        const res = await api.patch(
          `/folders/visits/${editingRecord.id}`,
          form
        );
        const { invoice, invoice_action } = res.data;

        if (invoice_action === "created") {
          toast.success(
            `Record updated. Invoice of ${formatNGN(
              invoice.total_amount
            )} generated.`
          );
        } else if (invoice_action === "updated") {
          toast.success(
            `Record updated. Invoice amount changed to ${formatNGN(
              invoice.total_amount
            )}.`
          );
        } else {
          toast.success("Visit record updated.");
        }
      } else {
        const res = await api.post(`/folders/files/${fileId}/visits`, form);
        const invoice = res.data.invoice;
        toast.success(
          invoice
            ? `Visit saved. Invoice of ${formatNGN(
                invoice.total_amount
              )} generated.`
            : "Visit record saved."
        );
      }
      setForm({
        visit_date: new Date().toISOString().split("T")[0],
        chief_complaint: "",
        physical_examination: "",
        investigation: "",
        test_results: "",
        blood_pressure: "",
        temperature_c: "",
        heart_rate: "",
        oxygen_saturation: "",
        diagnosis: "",
        notes: "",
        action_taken: "",
        consultation_fee: "",
      });
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save record.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-3xl border border-slate-200 dark:border-slate-700 shadow-2xl z-10 max-h-[92vh] flex flex-col">
        {/* Form header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingRecord ? "Edit Visit Record" : "New Visit Record"}
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">
              Patient:{" "}
              <span className="font-bold text-teal-600">{patientName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable form body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto p-6 space-y-6 flex-1"
        >
          {/* Visit date */}
          <FormField label="Visit Date">
            <input
              type="date"
              className={inputClass}
              value={form.visit_date}
              onChange={(e) => set("visit_date", e.target.value)}
            />
          </FormField>

          {/* Chief complaint */}
          <FormField label="Chief Complaint *">
            <input
              type="text"
              placeholder="e.g. Severe headache for 3 days"
              className={inputClass}
              value={form.chief_complaint}
              onChange={(e) => set("chief_complaint", e.target.value)}
            />
          </FormField>

          {/* Vitals row */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Vitals
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FormField label="Blood Pressure">
                <input
                  type="text"
                  placeholder="120/80"
                  className={inputClass}
                  value={form.blood_pressure}
                  onChange={(e) => set("blood_pressure", e.target.value)}
                />
              </FormField>
              <FormField label="Temperature (°C)">
                <input
                  type="number"
                  step="0.1"
                  placeholder="37.0"
                  className={inputClass}
                  value={form.temperature_c}
                  onChange={(e) => set("temperature_c", e.target.value)}
                />
              </FormField>
              <FormField label="Heart Rate (bpm)">
                <input
                  type="number"
                  placeholder="72"
                  className={inputClass}
                  value={form.heart_rate}
                  onChange={(e) => set("heart_rate", e.target.value)}
                />
              </FormField>
              <FormField label="SpO2 (%)">
                <input
                  type="number"
                  placeholder="98"
                  className={inputClass}
                  value={form.oxygen_saturation}
                  onChange={(e) => set("oxygen_saturation", e.target.value)}
                />
              </FormField>
            </div>
          </div>

          {/* Physical examination */}
          <FormField label="Physical Examination (P.E)">
            <textarea
              rows={3}
              placeholder="Findings from physical examination..."
              className={`${inputClass} resize-none`}
              value={form.physical_examination}
              onChange={(e) => set("physical_examination", e.target.value)}
            />
          </FormField>

          {/* Investigation */}
          <FormField label="Investigation">
            <textarea
              rows={2}
              placeholder="Investigations ordered or pending..."
              className={`${inputClass} resize-none`}
              value={form.investigation}
              onChange={(e) => set("investigation", e.target.value)}
            />
          </FormField>

          {/* Test results */}
          <FormField label="Test Results">
            <textarea
              rows={2}
              placeholder="Results of tests or investigations..."
              className={`${inputClass} resize-none`}
              value={form.test_results}
              onChange={(e) => set("test_results", e.target.value)}
            />
          </FormField>

          {/* Diagnosis */}
          <FormField label="Diagnosis">
            <textarea
              rows={3}
              placeholder="Clinical diagnosis..."
              className={`${inputClass} resize-none`}
              value={form.diagnosis}
              onChange={(e) => set("diagnosis", e.target.value)}
            />
          </FormField>

          {/* Notes */}
          <FormField label="Notes">
            <textarea
              rows={2}
              placeholder="Additional observations..."
              className={`${inputClass} resize-none`}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </FormField>

          {/* Action taken */}
          <FormField label="Action Taken">
            <input
              type="text"
              placeholder="e.g. Prescribed Amoxicillin, referred to specialist"
              className={inputClass}
              value={form.action_taken}
              onChange={(e) => set("action_taken", e.target.value)}
            />
          </FormField>

          {/* Consultation fee — triggers invoice */}
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-4">
            <FormField label="Hospital Bill (₦) — leave blank if not billing now">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₦
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`${inputClass} pl-8`}
                  value={form.consultation_fee}
                  onChange={(e) => set("consultation_fee", e.target.value)}
                />
              </div>
            </FormField>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              Entering a fee will automatically generate an invoice that appears
              in reception for payment.
            </p>
          </div>
        </form>

        {/* Sticky footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-4 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/25 cursor-pointer text-base"
          >
            {saving
              ? "Saving..."
              : editingRecord
              ? "Update Record"
              : "Save Visit Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SMALL HELPERS ─────────────────────────────────────────────────────────────
const FormField = ({ label, children }) => (
  <div>
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
      {label}
    </label>
    {children}
  </div>
);

const VitalChip = ({ icon, label, value, color }) => (
  <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
    <div
      className={`flex items-center gap-1 ${color} text-[10px] font-bold uppercase tracking-wider mb-1`}
    >
      {icon} {label}
    </div>
    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
      {value}
    </p>
  </div>
);

const ClinicalField = ({ icon, label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
      {icon} {label}
    </p>
    <p className="text-sm text-slate-700 dark:text-slate-300">{value}</p>
  </div>
);

// Renders nothing when value is empty, so the details grid only shows fields
// that were actually filled in.
const DetailItem = ({ label, value, wide }) => {
  if (!value) return null;
  return (
    <div className={wide ? "col-span-2 md:col-span-4" : ""}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};
