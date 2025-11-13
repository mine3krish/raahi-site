"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user?.isAdmin) router.push("/login");
  }, [user, isAuthenticated, loading]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading admin panel...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-20">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-6 space-y-6 transform transition-transform duration-300 ease-in-out z-30
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            <AdminLink href="/admin">Dashboard</AdminLink>
            <AdminLink href="/admin/properties">Properties</AdminLink>
            <AdminLink href="/admin/communities">Communities</AdminLink>
            <AdminLink href="/admin/contacts">Contacts</AdminLink>
            <AdminLink href="/admin/agents">Agents</AdminLink>
            <AdminLink href="/admin/users">Users</AdminLink>
            <AdminLink href="/admin/settings">Settings</AdminLink>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 md:ml-0 bg-white border-l border-gray-200 min-h-screen">
        <div className="mt-14 md:mt-0">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm md:hidden"
        />
      )}
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${
          active
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
        }`}
    >
      {children}
    </Link>
  );
}
