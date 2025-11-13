"use client";

import { Building2, Users, Star, Home, MessageSquare, Mail, Briefcase, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalProperties: number;
  featuredProperties: number;
  activeProperties: number;
  soldProperties: number;
  totalCommunities: number;
  totalContacts: number;
  newContacts: number;
  totalAgents: number;
  pendingAgents: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    featuredProperties: 0,
    activeProperties: 0,
    soldProperties: 0,
    totalCommunities: 0,
    totalContacts: 0,
    newContacts: 0,
    totalAgents: 0,
    pendingAgents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: "Total Properties", value: stats.totalProperties, icon: Building2, color: "blue" },
    { name: "Featured Properties", value: stats.featuredProperties, icon: Star, color: "yellow" },
    { name: "Active Properties", value: stats.activeProperties, icon: Home, color: "green" },
    { name: "Communities", value: stats.totalCommunities, icon: Users, color: "purple" },
    { name: "Total Contacts", value: stats.totalContacts, icon: MessageSquare, color: "indigo" },
    { name: "New Contacts", value: stats.newContacts, icon: Mail, color: "pink" },
    { name: "Agent Applications", value: stats.totalAgents, icon: Briefcase, color: "teal" },
    { name: "Pending Agents", value: stats.pendingAgents, icon: UserCheck, color: "orange" },
  ];

  if (loading) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-5 transition"
          >
            <div>
              <p className="text-gray-600 text-sm">{item.name}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{item.value}</h3>
            </div>
            <item.icon className={`w-10 h-10 text-${item.color}-600`} />
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/admin/properties/new"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Add Property
        </Link>
        <Link
          href="/admin/properties"
          className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Manage Properties
        </Link>
        <Link
          href="/admin/communities"
          className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Manage Communities
        </Link>
        <Link
          href="/admin/contacts"
          className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          View Contacts
        </Link>
        <Link
          href="/admin/agents"
          className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Agent Applications
        </Link>
        <Link
          href="/admin/users"
          className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Manage Users
        </Link>
      </div>

      {/* Recent Properties */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Properties</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-gray-600 text-sm">View recent property listings in the Properties section.</p>
        </div>
      </div>
    </section>
  );
}
