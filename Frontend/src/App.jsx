import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { startTokenRefresh, stopTokenRefresh } from "./utils/tokenRefresh";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./components/Dashboard";
import { ScrollTop } from "./layouts/ScrollToTop";
import AdminSchedule from "./sections/Appointments";
import BillsReceipts from "./sections/Billings";
import Profile from "./sections/Profile";
import MedicalRecords from "./sections/MedicalRecords";
import Pharmacy from "./sections/Pharmacy";
import Settings from "./sections/Settings";
import Support from "./sections/Support";
import BookAppointment from "./sections/BookAppointment";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleHome from "./components/RoleHome";
import Prescriptions from "./sections/Prescriptions";
import MyPatients from "./sections/Patients";
import MyAppointments from "./sections/MyAppointments";
import Overview from "./sections/Overview";
import DoctorSchedule from "./sections/DoctorSchedule";
import MedicalReport from "./sections/MedicalReports";
import Users from "./sections/Users";
import AdminReportRequests from "./sections/AdminReportRequests";
import SystemLogs from "./sections/SystemLogs";
import AllPrescriptions from "./sections/AllPrescriptions";
import ReceptionBills from "./sections/BillsandReceipts";
import Inventory from "./sections/Inventory";
import GoogleAuthSuccess from "./pages/GoogleAuthSuccess";
import SalesRecords from "./sections/PharmacySales";
import LabDashboard from "./sections/LabDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem("a4_token");

    if (token) {
      startTokenRefresh();
    }

    return () => {
      stopTokenRefresh();
    };
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Route>

        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<RoleHome />} />

            {/* Shared — any authenticated role */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "patient",
                    "doctor",
                    "admin",
                    "receptionist",
                    "pharmacy",
                    "lab",
                  ]}
                />
              }
            >
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="support" element={<Support />} />
            </Route>

            {/* Patient only */}
            <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
              <Route path="my-appointments" element={<MyAppointments />} />
              <Route path="pharmacy" element={<Pharmacy />} />
              <Route path="bookAppointment" element={<BookAppointment />} />
              <Route path="bills&receipts" element={<BillsReceipts />} />
              <Route path="medical-reports" element={<MedicalReport />} />
            </Route>

            {/* Doctor + Admin (admin can switch into the Doctor view via
                the dashboard role switcher — see Dashboard.jsx) */}
            <Route
              element={<ProtectedRoute allowedRoles={["doctor", "admin"]} />}
            >
              <Route path="overview" element={<Overview />} />
              <Route path="schedule" element={<DoctorSchedule />} />
              <Route path="patients" element={<MyPatients />} />
              <Route path="prescriptions" element={<Prescriptions />} />
            </Route>

            {/* Doctor + Receptionist + Admin — clinical documentation
                (matches the backend "folders" route group) */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["doctor", "receptionist", "admin"]}
                />
              }
            >
              <Route path="medical-records" element={<MedicalRecords />} />
            </Route>

            {/* Admin only */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="users" element={<Users />} />
              <Route path="logs" element={<SystemLogs />} />
              <Route
                path="report-requests"
                element={<AdminReportRequests />}
              />
            </Route>

            {/* Receptionist + Admin */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["receptionist", "admin"]} />
              }
            >
              <Route path="appointments" element={<AdminSchedule />} />
            </Route>

            {/* Receptionist + Admin + Pharmacy */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["receptionist", "admin", "pharmacy"]}
                />
              }
            >
              <Route
                path="bills-and-receipts"
                element={<ReceptionBills />}
              />
              <Route
                path="all-prescriptions"
                element={<AllPrescriptions />}
              />
            </Route>

            {/* Pharmacy + Admin + Doctor */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["pharmacy", "admin", "doctor"]}
                />
              }
            >
              <Route path="Inventory" element={<Inventory />} />
            </Route>

            {/* Pharmacy + Admin + Receptionist — shared sales desk
                (see RoleHome.jsx: both land on sales-records by default) */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["pharmacy", "admin", "receptionist"]}
                />
              }
            >
              <Route path="sales-records" element={<SalesRecords />} />
            </Route>

            {/* Lab + Admin — doctors order tests from inside a patient's
                file (Medical Records), not via this full worklist page */}
            <Route
              element={<ProtectedRoute allowedRoles={["lab", "admin"]} />}
            >
              <Route path="lab" element={<LabDashboard />} />
            </Route>
          </Route>
        </Route>
      </Routes>

      <ScrollTop />
    </>
  );
}