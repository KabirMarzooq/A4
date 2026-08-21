import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Users,
  Calendar,
  Activity,
  Pill,
  LayoutDashboard,
  CreditCard,
  Settings,
  LifeBuoy,
  LogOut,
  ChevronRight,
  Bell,
  Monitor,
  Box,
  CalendarDays,
  RefreshCw,
  FlaskConical,
  BedDouble,
} from "lucide-react";
import { useTheme } from "../layouts/ThemeContext";
import api from "../services/api";
import { stopTokenRefresh } from "../utils/tokenRefresh";
import { useNotifications } from "../hooks/useNotifications";
import { isActingAsDoctor } from "../utils/roleDisplay";

// Role Configuration
const ROLE_NAV_ITEMS = {
  Patient: [
    {
      label: "Appointments",
      path: "/dashboard/my-appointments",
      icon: Calendar,
      notificationKey: "my-appointments",
      title: "View your appointments",
    },
    {
      label: "Prescriptions",
      path: "/dashboard/pharmacy",
      icon: Pill,
      notificationKey: "my-prescriptions",
      title: "Access my prescriptions",
    },
    {
      label: "Book Visit",
      path: "/dashboard/bookAppointment",
      icon: Calendar,
      notificationKey: "book-appointments",
      title: "Book appointments",
    },
    {
      label: "Billing",
      path: "/dashboard/bills&receipts",
      icon: CreditCard,
      notificationKey: "bills-and-receipts",
      title: "Manage billing and payments",
    },
    {
      label: "Reports",
      path: "/dashboard/medical-reports",
      icon: Activity,
      notificationKey: "medical-reports",
      title: "View medical reports",
    },
  ],
  Doctor: [
    {
      label: "Overview",
      path: "/dashboard/overview",
      icon: LayoutDashboard,
      notificationKey: "overview",
      title: "View dashboard overview",
    },
    {
      label: "Schedule",
      path: "/dashboard/schedule",
      icon: CalendarDays,
      notificationKey: "schedule",
      title: "Manage appointments",
    },
    {
      label: "Patients",
      path: "/dashboard/patients",
      icon: Users,
      notificationKey: "my-patients",
      title: "Manage patients",
    },
    {
      label: "Prescriptions",
      path: "/dashboard/prescriptions",
      icon: Pill,
      notificationKey: "prescriptions",
      title: "View prescriptions",
    },
    {
      label: "Records",
      path: "/dashboard/medical-records",
      icon: Activity,
      notificationKey: "medical-records",
      title: "View medical records",
    },
    {
      label: "Admissions",
      path: "/dashboard/admissions",
      icon: BedDouble,
      notificationKey: "admissions",
      title: "Patients on the ward",
    },
  ],
  Admin: [
    {
      label: "Sales",
      path: "/dashboard/sales-records",
      icon: CreditCard,
      notificationKey: "sales-records",
      title: "View sales records",
    },
    {
      label: "Users",
      path: "/dashboard/users",
      icon: Users,
      notificationKey: "users",
      title: "Manage all users",
    },
    {
      label: "Schedules",
      path: "/dashboard/appointments",
      icon: Calendar,
      notificationKey: "all-appointments",
      title: "Manage schedule",
    },
    {
      label: "Billing",
      path: "/dashboard/bills-and-receipts",
      icon: CreditCard,
      notificationKey: "all-bills-and-receipts",
      title: "Manage billing and payments",
    },
    {
      label: "Records",
      path: "/dashboard/medical-records",
      icon: Activity,
      notificationKey: "medical-records",
      title: "View medical records",
    },
    {
      label: "Inventory",
      path: "/dashboard/inventory",
      icon: Box,
      notificationKey: "inventory",
      title: "Manage inventory",
    },
    {
      label: "Logs",
      path: "/dashboard/logs",
      icon: Monitor,
      notificationKey: "system-logs",
      title: "View system logs",
    },
    {
      label: "Admissions",
      path: "/dashboard/admissions",
      icon: BedDouble,
      notificationKey: "admissions",
      title: "Patients on the ward",
    },
    {
      label: "Requests",
      path: "/dashboard/report-requests",
      icon: Activity,
      notificationKey: "report-requests",
      title: "View report requests",
    },
  ],
  Receptionist: [
    {
      label: "Schedules",
      path: "/dashboard/appointments",
      icon: Calendar,
      notificationKey: "all-appointments",
      title: "Manage schedule",
    },
    {
      label: "Billing",
      path: "/dashboard/bills-and-receipts",
      icon: CreditCard,
      notificationKey: "all-bills-and-receipts",
      title: "Manage billing and payments",
    },
    {
      label: "Prescriptions",
      path: "/dashboard/all-prescriptions",
      icon: Pill,
      notificationKey: "all-prescriptions",
      title: "View prescriptions",
    },
    {
      label: "Records",
      path: "/dashboard/medical-records",
      icon: Activity,
      notificationKey: "medical-records",
      title: "View medical reports",
    },
    {
      label: "Admissions",
      path: "/dashboard/admissions",
      icon: BedDouble,
      notificationKey: "admissions",
      title: "Patients on the ward",
    },
  ],
  Pharmacy: [
    {
      label: "Sales",
      path: "/dashboard/sales-records",
      icon: CreditCard,
      notificationKey: "sales-records",
      title: "View sales records",
    },
    {
      label: "Prescriptions",
      path: "/dashboard/all-prescriptions",
      icon: Pill,
      notificationKey: "all-prescriptions",
      title: "View prescriptions",
    },
    {
      label: "Inventory",
      path: "/dashboard/inventory",
      icon: Box,
      notificationKey: "inventory",
      title: "Manage inventory",
    },
  ],
  Lab: [
    {
      label: "Lab",
      path: "/dashboard/lab",
      icon: FlaskConical,
      notificationKey: "lab-orders",
      title: "Manage lab orders",
    },
  ],
  // Add more roles here easily
};

// Label lookup only — which role a given view can switch to. Actual
// eligibility to USE the switcher is gated separately below (only a real
// admin account, never a genuine doctor account, ever sees the control),
// so this map being bidirectional just lets the button read correctly
// once already switched into "Doctor" view.
const ROLE_SWITCH_PAIRS = {
  Admin: "Doctor",
  Doctor: "Admin",
};

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  // Read synchronously (not via useEffect) so normalizedRole/activeRole are
  // correct on the very first render — an async load here previously left
  // activeRole briefly initialized against a not-yet-loaded "Patient"
  // default, flashing the wrong sidebar for a tick before self-correcting.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("a4_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isSwitching, setIsSwitching] = useState(false);

  const userRole = user?.role || null;
  const userName = user?.name || "User";

  // The account's real, fixed role (users.role in the database) — this
  // never changes for the lifetime of the session, unlike activeRole below.
  const normalizedRole = userRole
    ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase()
    : "Patient";

  const { notifications, clearNotification } = useNotifications(userRole);

  // Which nav set is currently displayed. Only ever differs from
  // normalizedRole for a real admin account that has switched to "Doctor" —
  // enforced by the sanitizing effect below, not just by this initializer.
  const [activeRole, setActiveRole] = useState(
    () => sessionStorage.getItem("a4_active_role") || normalizedRole
  );

  useEffect(() => {
    // Only an admin account may ever have an activeRole other than its own
    // normalizedRole. Any stale/tampered sessionStorage value for every
    // other role gets reset here — real enforcement of what data can
    // actually be fetched still happens server-side (RoleMiddleware) and
    // at the route-guard layer (ProtectedRoute), this is just UI hygiene.
    const validRoles =
      normalizedRole === "Admin" ? ["Admin", "Doctor"] : [normalizedRole];
    const stored = sessionStorage.getItem("a4_active_role");
    if (!stored || !validRoles.includes(stored)) {
      setActiveRole(normalizedRole);
    }
  }, [normalizedRole]);

  if (!user) return null;

  const navItems = ROLE_NAV_ITEMS[activeRole] || ROLE_NAV_ITEMS["Patient"];

  const handleRoleSwitch = () => {
    const switchTo = ROLE_SWITCH_PAIRS[activeRole];
    if (!switchTo) return;
    setIsSwitching(true);
    setTimeout(() => {
      sessionStorage.setItem("a4_active_role", switchTo);
      setActiveRole(switchTo);
      setIsSwitching(false);
    }, 800);
  };

  const handleLogout = async () => {
    try {
      // Call backend to invalidate token
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Stop token refresh
      stopTokenRefresh();

      // Clear local storage
      localStorage.removeItem("a4_token");
      sessionStorage.removeItem("a4_active_role");

      // Redirect to login
      window.location.href = "/login";
    }
  };

  // Handle Initials - First and Last name
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "?";

    const nameParts = name.trim().split(" ").filter(Boolean); // Removing empty strings

    if (nameParts.length === 0) return "?";
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();

    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(userName);

  return (
    <div className="font-sans transition-colors duration-300">
      <div className="min-h-[100dvh] w-full bg-[#F8FAFC] dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden fixed left-0 top-1/3 -translate-y-1/2 z-[60] bg-cyprus text-white p-2 rounded-r-xl shadow-lg border border-l-0 border-white/20 transition-all hover:bg-teal-700"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <ChevronRight size={24} />
          </motion.div>
        </button>

        {/* Sidebar Container */}
        <aside
          className={`
  fixed inset-y-0 left-0 z-50 w-64 bg-cyprus text-white flex flex-col p-6 m-0 lg:m-4 
  lg:rounded-3xl shadow-2xl transition-transform duration-500 ease-in-out
  ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
  lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]
`}
        >
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-teal-500 p-2 rounded-lg">
              <Activity size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold italic">A4 Medical</span>
          </div>

          <nav className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => {
                  setIsOpen(false);
                  if (item.notificationKey)
                    clearNotification(item.notificationKey);
                }}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative
                  ${
                    isActive
                      ? "bg-white text-cyprus shadow-lg"
                      : "text-gray-300 hover:bg-white/10"
                  }
                `}
                title={item.title}
              >
                <div className="relative">
                  <item.icon size={20} />
                  {notifications[item.notificationKey] && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-olive opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-olive" />
                    </span>
                  )}
                </div>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom Nav Section */}
          <div className="pt-10 mt-10 border-t border-white/10 space-y-2">
            {[
              {
                label: "Profile",
                path: "/dashboard/profile",
                icon: Users,
                notificationKey: "profile",
                title: "View your profile",
              },
              {
                label: "Settings",
                path: "/dashboard/settings",
                icon: Settings,
                notificationKey: "settings",
                title: "Manage settings",
              },
              {
                label: "Support",
                path: "/dashboard/support",
                icon: LifeBuoy,
                notificationKey: "support",
                title: "Get support",
              },
            ].map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => {
                  setIsOpen(false);
                  if (item.notificationKey)
                    clearNotification(item.notificationKey);
                }}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all
                  ${
                    isActive
                      ? "border border-white/50 bg-white/5"
                      : "text-gray-400 hover:text-white"
                  }
                `}
                title={item.title}
              >
                <div className="relative">
                  <item.icon size={18} />
                  {notifications[item.notificationKey] && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-olive opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-olive" />
                    </span>
                  )}
                </div>
                {item.label}
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full rounded-lg mt-4 transition-all cursor-pointer"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>
        {/* Overlay to close sidebar */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Main Content Area.
            min-w-0 is load-bearing: as a flex item its default min-width is
            "auto" (= content min-width), so a wide descendant — e.g. the
            dialysis register's min-w-[1400px] table — would stretch <main>
            past the viewport and make the WHOLE shell scroll sideways
            instead of just that table's own overflow-x-auto wrapper. */}
        <main className="flex-1 min-w-0 flex flex-col">
          <header className="h-20 px-1 md:px-8 flex items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 backdrop-blur-xl sticky top-0 z-20 w-full">
            {normalizedRole === "Admin" ? (
              <div className="flex items-center sm:gap-4 gap-1">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                    {activeRole} Dashboard
                  </span>
                </div>

                <button
                  onClick={handleRoleSwitch}
                  disabled={isSwitching}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-600 transition-all shadow-sm cursor-pointer disabled:opacity-70"
                >
                  <RefreshCw
                    size={14}
                    className={isSwitching ? "animate-spin" : ""}
                  />
                  {isSwitching
                    ? `Switching to ${ROLE_SWITCH_PAIRS[activeRole]}...`
                    : `Switch to ${ROLE_SWITCH_PAIRS[activeRole]}`}
                </button>
              </div>
            ) : (
              normalizedRole !== "Patient" && (
                <div className="flex items-center sm:gap-4 gap-1">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                      {normalizedRole} Dashboard
                    </span>
                  </div>
                </div>
              )
            )}

            <div className="flex items-center gap-6 justify-end">
              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative w-14 h-7 hidden sm:flex items-center bg-gray-200 dark:bg-teal-900 rounded-full p-1 transition-colors duration-500 shadow-inner cursor-pointer"
                aria-label="Toggle theme"
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  className={`bg-white dark:bg-teal-400 w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
                    theme === "dark" ? "ml-auto" : ""
                  }`}
                >
                  {theme === "dark" ? (
                    <Moon size={12} className="text-teal-900" />
                  ) : (
                    <Sun size={12} className="text-yellow-500" />
                  )}
                </motion.div>
                <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
                  {theme !== "dark" && (
                    <Moon size={10} className="ml-auto text-gray-400" />
                  )}
                  {theme === "dark" && (
                    <Sun size={10} className="text-teal-200" />
                  )}
                </div>
              </button>

              <div className="flex items-center gap-3 sm:gap-4 sm:border-l pl-2 sm:pl-6 border-gray-200 dark:border-slate-800">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold dark:text-white">
                    {isActingAsDoctor(user, activeRole) && "Dr. "}
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                  {initials}
                </div>
              </div>
            </div>
          </header>

          {/* Th different page Content Outlet */}
          <div className="px-2 sm:px-4 md:px-8 pb-4 md:pb-8 pt-5 flex-1 min-w-0 w-full max-w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
