import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Palette,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "../layouts/ThemeContext";
import api from "../services/api";
import toast from "react-hot-toast";
import { isActingAsDoctor, getStoredActiveRole } from "../utils/roleDisplay";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("overview");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate(); 

  // Fetch user data from backend
  const [doctor, setDoctor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    phone: "",
    specialty: "",
    license: "",
    profileImage: null,
  });

  const [loading, setLoading] = useState(true);

  // Fetch user profile when the component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/user-profile");
        const user = response.data;

        setDoctor({
          firstName: user.name?.split(" ")[0] || "",
          lastName: user.name?.split(" ").slice(1).join(" ") || "",
          email: user.email || "",
          role: user.role || "",
          phone: user.phone || "",
          specialty: user.specialization || "",
          license: user.license_id || user.staff_id || "",
          profileImage: null,
        });
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Update usres Email Handler
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    const newEmail = e.target.newEmail.value;

    if (!newEmail || newEmail === doctor.email) {
      toast.error("Please enter a different email");
      return;
    }

    try {
      const response = await api.patch("/user/update-email", {
        email: newEmail,
      });
      toast.success(response.data.message || "Email updated successfully!");
      setDoctor({ ...doctor, email: newEmail });
      e.target.reset();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update email";
      toast.error(errorMsg);
    }
  };

  // Update users Password Handler
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const currentPassword = e.target.currentPassword.value;
    const newPassword = e.target.newPassword.value;

    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    try {
      const response = await api.patch("/user/update-password", {
        currentPassword,
        newPassword,
      });
      toast.success(response.data.message || "Password updated successfully!");
      e.target.reset();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update password";
      toast.error(errorMsg);
    }
  };

  // Delete user Account Handler. The "type DELETE" gate lives in the
  // ConfirmDialog (requireTypedConfirmation) rather than a native prompt().
  const handleDeleteAccount = async () => {
    try {
      const response = await api.delete("/user/delete-account");
      toast.success(response.data.message || "Account deleted successfully");

      // Clear token and redirect to login
      localStorage.removeItem("a4_token");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to delete account. Please contact support.";
      toast.error(errorMsg);
      throw err; // keeps the confirm dialog open on failure
    }
  };

  // Get initials Helper for each user
  const getInitials = () => {
    const f = doctor.firstName ? doctor.firstName.charAt(0) : "";
    const l = doctor.lastName ? doctor.lastName.charAt(0) : "";
    return (f + l).toUpperCase() || "DR";
  };

  const tabs = [
    { id: "overview", label: "Profile Overview", icon: <User size={18} /> },
    { id: "security", label: "Account & Security", icon: <Lock size={18} /> },
    {
      id: "appearance",
      label: "Appearance & Preferences",
      icon: <Palette size={18} />,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:p-6 transition-colors duration-300 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your account preferences and practice details.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Navigation Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 shadow-sm dark:shadow-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Column: Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[500px]">
          {/* PROFILE OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="p-2 sm:p-8 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white p-3 sm:p-0 sm:mb-6">
                Profile Overview
              </h3>

              <div className="flex flex-col md:flex-row items-start gap-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-transparent">
                
                <div className="w-24 h-24 rounded-full flex-shrink-0 bg-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-teal-500/20">
                  {doctor.profileImage ? (
                    <img
                      src={doctor.profileImage}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name - conditionally add Dr. prefix */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                        Full Name
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {isActingAsDoctor(
                          { role: doctor.role },
                          getStoredActiveRole()
                        ) && "Dr. "}
                        {doctor.firstName || "-"} {doctor.lastName || "-"}
                      </p>
                    </div>

                    {/* Email Address */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                        Email Address
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {doctor.email || "-"}
                      </p>
                    </div>

                    {/* Role */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                        Role
                      </p>
                      <span className="px-3 py-1 bg-teal-50 dark:bg-slate-800 border border-teal-100 dark:border-slate-700 text-teal-600 dark:text-teal-400 rounded-lg text-xs font-bold inline-block">
                        {doctor.role || "User"}
                      </span>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                        Phone Number
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-slate-300">
                        {doctor.phone || "-"}
                      </p>
                    </div>

                    {/* Specialty - Only for Doctors */}
                    {doctor.role?.toLowerCase() === "doctor" && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                          Specialty
                        </p>
                        <span className="px-3 py-1 bg-teal-50 dark:bg-slate-800 border border-teal-100 dark:border-slate-700 text-teal-600 dark:text-teal-400 rounded-lg text-xs font-bold inline-block">
                          {doctor.specialty || "Unspecified"}
                        </span>
                      </div>
                    )}

                    {/* Medical License - Only for Doctors */}
                    {doctor.role?.toLowerCase() === "doctor" && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                          Medical License ID
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-slate-300 font-mono text-sm">
                          {doctor.license || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700">
                    <NavLink
                      to="/dashboard/profile"
                      className="flex items-center gap-2 text-sm font-bold text-teal-600 dark:text-teal-500 hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
                    >
                      Edit details in Profile Tab <ExternalLink size={16} />
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="p-8 animate-in fade-in duration-300 space-y-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                Account & Security
              </h3>

              <div className="space-y-8">
                {/* CHANGE PASSWORD SECTION */}
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Change Password
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="currentPassword"
                      type="password"
                      placeholder="Current Password"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                      required
                      minLength={6}
                    />
                    <input
                      name="newPassword"
                      type="password"
                      placeholder="New Password (min 6 characters)"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                      required
                      minLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 dark:bg-slate-700 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-colors duration-300 ease-in-out cursor-pointer"
                  >
                    Update Password
                  </button>
                </form>

                <hr className="border-slate-100 dark:border-slate-700" />

                {/* CHANGE EMAIL SECTION */}
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Change Email Address
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Current email:{" "}
                    <span className="font-bold text-teal-600">
                      {doctor.email}
                    </span>
                  </p>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      name="newEmail"
                      type="email"
                      placeholder="New Email Address"
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-colors duration-300 ease-in-out cursor-pointer"
                    >
                      Update Email
                    </button>
                  </div>
                </form>

                <hr className="border-slate-100 dark:border-slate-700" />

                {/* DANGER ZONE (ACCOUNT DELETION) */}
                <div className="bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 p-6 rounded-3xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-2xl">
                      <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-red-600 dark:text-red-500">
                        Danger Zone
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                        Deleting your account is permanent. All appointment
                        history, schedules, and profile data will be removed
                        from our servers immediately.
                      </p>
                      <button
                        onClick={() => setConfirmDeleteOpen(true)}
                        type="button"
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-500/20 cursor-pointer"
                      >
                        Delete A4 Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === "appearance" && (
            <div className="py-8 px-3 sm:p-8 animate-in fade-in duration-300 space-y-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                Appearance & Preferences
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">
                  Theme Interface
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* LIGHT MODE CARD */}
                  <button
                    onClick={() => setTheme("light")}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-2xl transition-all cursor-pointer group ${
                      theme === "light"
                        ? "border-teal-500 bg-teal-50/30 dark:bg-teal-500/5"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div className="w-16 h-12 bg-slate-100 rounded-lg mb-3 border border-slate-200" />
                    <span
                      className={`text-sm font-bold ${
                        theme === "light"
                          ? "text-teal-600"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Light Mode
                    </span>
                    {theme === "light" && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full" />
                    )}
                  </button>

                  {/* DARK MODE CARD */}
                  <button
                    onClick={() => setTheme("dark")}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-2xl transition-all cursor-pointer group ${
                      theme === "dark"
                        ? "border-teal-500 bg-teal-500/5"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div className="w-16 h-12 bg-slate-900 rounded-lg mb-3 border border-slate-700" />
                    <span
                      className={`text-sm font-bold ${
                        theme === "dark"
                          ? "text-teal-500"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Dark Mode
                    </span>
                    {theme === "dark" && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full" />
                    )}
                  </button>

                  {/* SYSTEM MODE CARD */}
                  <button
                    onClick={() => setTheme("system")}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-2xl transition-all cursor-pointer group ${
                      theme === "system"
                        ? "border-teal-500 bg-teal-500/5"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div className="w-16 h-12 bg-gradient-to-br from-slate-100 to-slate-900 rounded-lg mb-3 border border-slate-400/30" />
                    <span
                      className={`text-sm font-bold ${
                        theme === "system"
                          ? "text-teal-500"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      System
                    </span>
                    {theme === "system" && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full" />
                    )}
                  </button>
                </div>

                <p className="mt-6 text-xs text-slate-500 dark:text-slate-400 italic">
                  * System mode will automatically switch themes based on your
                  device settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently delete your account?"
        message={
          "This is permanent and cannot be undone.\n\n• Your appointments will be deleted\n• Your records will be removed\n• You will be logged out immediately"
        }
        confirmLabel="Delete My Account"
        requireTypedConfirmation="DELETE"
        danger
      />
    </div>
  );
}
