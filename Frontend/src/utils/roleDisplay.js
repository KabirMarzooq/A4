// True when the user is presenting as a doctor — either because their real
// account role is doctor, or because they're an admin currently switched
// into the Doctor tab (Dashboard.jsx's activeRole, stored in sessionStorage
// under "a4_active_role"). Real permissions are still enforced server-side;
// this only controls display (e.g. the "Dr." name prefix).
export function isActingAsDoctor(user, activeRole) {
  if (user?.role?.toLowerCase() === "doctor") return true;
  if (activeRole && activeRole.toLowerCase() === "doctor") return true;
  return false;
}

// Reads the switched-role override directly from sessionStorage, for
// components that don't already receive activeRole as a prop/context.
export function getStoredActiveRole() {
  return sessionStorage.getItem("a4_active_role") || null;
}

export function displayName(user, activeRole) {
  const name = user?.name || "";
  return isActingAsDoctor(user, activeRole) ? `Dr. ${name}` : name;
}

// For a "doctor" field embedded in a record fetched from the backend
// (invoice.doctor, visit record.doctor, etc.): only doctor and admin
// accounts can ever appear there (admins only when they created the record
// while switched into the Doctor tab), so both roles get the "Dr." prefix.
export function isDoctorRecordAuthor(doctorUser) {
  const role = doctorUser?.role?.toLowerCase();
  return role === "doctor" || role === "admin";
}
