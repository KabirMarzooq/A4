import { Navigate } from "react-router-dom";

export default function RoleHome() {
  const savedUser = localStorage.getItem("a4_user");
  if (!savedUser) return <Navigate to="/login" replace />;

  const { role } = JSON.parse(savedUser);

  // Definitions of the "Home" path for each role
  const roleDefaults = {
    patient: "/dashboard/my-appointments",
    doctor: "/dashboard/overview",
    admin: "/dashboard/sales-records",
    receptionist: "/dashboard/sales-records",
    pharmacy: "/dashboard/sales-records",
    lab: "/dashboard/lab",
  };

  const targetPath = roleDefaults[role.toLowerCase()] || "/login";

  return <Navigate to={targetPath} replace />;
}
