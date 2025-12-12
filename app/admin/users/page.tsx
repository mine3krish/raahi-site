"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserCheck, UserX, Mail } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  authMethod?: string;
  isVerified?: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(search.toLowerCase())) ||
      (user.mobile && user.mobile.includes(search))
  );

  if (loading) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <div className="text-sm text-gray-600">
          Total Users: <span className="font-semibold">{users.length}</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 max-w-md">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search users by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Contact
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Joined
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {user.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={14} />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        )}
                        {user.mobile && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-sm">📱 {user.mobile}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-400">
                          {user.authMethod === 'mobile' ? 'Mobile Login' : 'Email Login'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isVerified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1 w-fit">
                          <UserCheck size={12} />
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center gap-1 w-fit">
                          ⏳ Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAdminStatus(user._id, user.isAdmin)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
                          user.isAdmin
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {user.isAdmin ? (
                          <>
                            <UserX size={14} />
                            Remove Admin
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} />
                            Make Admin
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}

