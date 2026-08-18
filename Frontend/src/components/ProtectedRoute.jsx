import { Navigate, Outlet } from "react-router-dom";

// allowedRoles: optional array of lowercase role strings (e.g. ["doctor", "admin"]).
// Omit it for a plain "must be logged in" guard. When present, it must mirror
// the matching backend route group's role: middleware in routes/api.php —
// this exists so a page's UI shell can't render for a role the API would
// reject anyway (previously any authenticated user could navigate straight
// to any dashboard URL and see the page shell before the API calls 403'd).
const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("a4_token");

  // If there is no token, send user to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const savedUser = localStorage.getItem("a4_user");
    const role = savedUser ? JSON.parse(savedUser)?.role?.toLowerCase() : null;

    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If there is a token (and the role check, if any, passed), let user through
  return <Outlet />;
};

export default ProtectedRoute;