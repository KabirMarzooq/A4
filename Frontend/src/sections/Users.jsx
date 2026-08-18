import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

export default function Users() {
  const [userData, setUserData] = useState({ data: [], from: 1 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400); // wait 400ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm, selectedRole, selectedStatus]);

  const fetchUsers = async (page = 1) => {
    try {
      const response = await api.get("/admin/users", {
        params: {
          page,
          search: searchTerm,
          role: selectedRole,
          status: selectedStatus,
        },
      });
      setUserData(response.data);
    } catch (err) {
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "doctor":
        return "bg-teal-500/10 text-teal-500 border-teal-500/20";
      case "pharmacy":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "receptionist":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User removed successfully.");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role: newRole });
      toast.success("Role updated successfully.");
      fetchUsers();
      setOpenMenuId(null);
    } catch {
      toast.error("Failed to update role.");
    }
  };

  const handleApproveUser = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/approve`);
      toast.success("User approved.");
      fetchUsers();
      setOpenMenuId(null);
    } catch {
      toast.error("Failed to approve user.");
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            User Management
          </h2>
          <p className="text-slate-500 text-sm">
            Monitor and manage all system accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 dark:text-white cursor-pointer"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
          <select
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 dark:text-white cursor-pointer"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admins</option>
            <option value="doctor">Doctors</option>
            <option value="patient">Patients</option>
            <option value="receptionist">Receptionist</option>
            <option value="pharmacy">Pharmacy</option>
          </select>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-2 mb-6 flex flex-col md:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full bg-transparent py-3 pl-12 pr-4 text-slate-900 dark:text-white outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  #
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  User Details
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Role
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Contact
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Activity
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {userData.data.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                >
                  {/* Row Number Calculation */}
                  <td className="px-6 py-4 text-sm font-medium text-slate-400">
                    {(userData.from + index).toString().padStart(2, "0")}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail size={10} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                      {user.status === "pending" && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase border bg-orange-500/10 text-orange-500 border-orange-500/20">
                          Pending Approval
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Phone size={14} className="text-slate-300" />{" "}
                      {user.phone || "N/A"}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> Joined:{" "}
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-teal-500 font-bold flex items-center gap-1">
                        <Clock size={12} /> Visit:{" "}
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleDateString()
                          : "Never"}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (openMenuId === user.id) {
                          setOpenMenuId(null);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setMenuPosition({
                            top: rect.bottom + window.scrollY + 8,
                            left: rect.left + window.scrollX - 160,
                          });
                          setOpenMenuId(user.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-teal-500 transition-colors cursor-pointer"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/30">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="text-slate-900 dark:text-white font-bold">
              {userData.from}
            </span>{" "}
            to{" "}
            <span className="text-slate-900 dark:text-white font-bold">
              {userData.to}
            </span>{" "}
            of {userData.total} users
          </p>
          <div className="flex gap-2">
            <button
              disabled={!userData.prev_page_url}
              onClick={() => fetchUsers(userData.current_page - 1)}
              className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={!userData.next_page_url}
              onClick={() => fetchUsers(userData.current_page + 1)}
              className="px-4 py-2 text-xs font-bold bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {openMenuId && createPortal(
        <div
          style={{ top: menuPosition.top, left: menuPosition.left }}
          className="absolute z-[999] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 w-48"
          onClick={(e) => e.stopPropagation()}
        >
          {userData.data.find((u) => u.id === openMenuId)?.status ===
            "pending" && (
            <>
              <button
                onClick={() => handleApproveUser(openMenuId)}
                className="w-full text-left px-3 py-1.5 text-sm rounded-lg text-teal-600
            hover:bg-teal-50 dark:hover:bg-teal-900/20 flex items-center gap-2 transition-colors cursor-pointer font-bold"
              >
                <CheckCircle2 size={14} /> Approve Account
              </button>
              <div className="border-t border-slate-100 dark:border-slate-700 my-2" />
            </>
          )}

          <p className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1">
            Change Role
          </p>
          {["admin", "doctor", "patient", "receptionist", "pharmacy"].map(
            (role) => {
              const currentUser = userData.data.find(
                (u) => u.id === openMenuId
              );
              return (
                <button
                  key={role}
                  onClick={() => handleRoleChange(openMenuId, role)}
                  disabled={currentUser?.role?.toLowerCase() === role}
                  className="w-full text-left px-3 py-1.5 text-sm rounded-lg capitalize
            text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/30
            disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {role}
                </button>
              );
            }
          )}

          <div className="border-t border-slate-100 dark:border-slate-700 my-2" />

          <button
            onClick={() => handleDeleteUser(openMenuId)}
            className="w-full text-left px-3 py-1.5 text-sm rounded-lg text-red-500
        hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 size={14} /> Remove User
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
