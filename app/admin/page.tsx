
"use client";
import React, { useEffect, useState } from "react";
interface Auction {
  id: string;
  name: string;
  AuctionDate: string;
  location: string;
  state: string;
  status: string;
}

import { Building2, Users, Star, Home, MessageSquare, Mail, Briefcase, UserCheck } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalProperties: number;
  featuredProperties: number;
  bestDealProperties: number;
  premiumProperties: number;
  totalPremiumProjects: number;
  activeProperties: number;
  soldProperties: number;
  totalCommunities: number;
  totalContacts: number;
  newContacts: number;
  totalAgents: number;
  pendingAgents: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'auctions' | 'inspections'>('auctions');
  // ...existing code...
  const [auctionsToday, setAuctionsToday] = useState<Auction[]>([]);
  const [auctionsLoading, setAuctionsLoading] = useState(true);
  const [selectedAuctionDate, setSelectedAuctionDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  });
  const [selectedAuctionState, setSelectedAuctionState] = useState('Gujarat');

  useEffect(() => {
    if (activeTab !== 'auctions') return;
    const fetchAuctions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/admin/auctions-today?date=${selectedAuctionDate}&state=${encodeURIComponent(selectedAuctionState)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setAuctionsToday(data.auctions || []);
        }
      } catch (err) {
        // ignore
      } finally {
        setAuctionsLoading(false);
      }
    };
    fetchAuctions();
  }, [selectedAuctionDate, selectedAuctionState, activeTab]);
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    featuredProperties: 0,
    bestDealProperties: 0,
    premiumProperties: 0,
    totalPremiumProjects: 0,
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
    { name: "Total Properties", value: stats.totalProperties, icon: Building2, color: "blue", link: "/admin/properties" },
    { name: "Featured Properties", value: stats.featuredProperties, icon: Star, color: "yellow", link: "/admin/properties?featured=true" },
    { name: "Best Deals", value: stats.bestDealProperties, icon: Home, color: "green", link: "/admin/properties?bestDeal=true" },
    { name: "Premium", value: stats.premiumProperties, icon: Star, color: "purple", link: "/admin/properties?premium=true" },
    { name: "Premium Projects", value: stats.totalPremiumProjects, icon: Building2, color: "emerald", link: "/admin/premium-projects" },
    { name: "Active Properties", value: stats.activeProperties, icon: Home, color: "green", link: "/admin/properties?status=Active" },
    { name: "Communities", value: stats.totalCommunities, icon: Users, color: "purple", link: "/admin/communities" },
    { name: "Total Contacts", value: stats.totalContacts, icon: MessageSquare, color: "indigo", link: "/admin/contacts" },
    { name: "New Contacts", value: stats.newContacts, icon: Mail, color: "pink", link: "/admin/contacts?status=new" },
    { name: "Agent Applications", value: stats.totalAgents, icon: Briefcase, color: "teal", link: "/admin/agents" },
    { name: "Pending Agents", value: stats.pendingAgents, icon: UserCheck, color: "orange", link: "/admin/agents?status=pending" },
  ];

  if (loading) {
      if (auctionsLoading) {
        return (
          <section>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-yellow-600"></div>
            </div>
          </section>
        );
      }
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
          <Link key={item.name} href={item.link || "#"}>
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-5 transition hover:bg-gray-100 cursor-pointer">
              <div>
                <p className="text-gray-600 text-sm">{item.name}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{item.value}</h3>
              </div>
              <item.icon className={`w-10 h-10 text-${item.color}-600`} />
            </div>
          </Link>
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
          href="/admin/branches"
          className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Manage Branches
        </Link>
        <Link
          href="/admin/users"
          className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Manage Users
        </Link>
      </div>


      {/* Tabs for Auctions and Inspections */}
      <div className="flex gap-2 mt-10 mb-4">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition ${activeTab === 'auctions' ? 'border-yellow-500 bg-yellow-50 text-yellow-900' : 'border-transparent bg-gray-100 text-gray-500'}`}
          onClick={() => setActiveTab('auctions')}
        >
          Auctions
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition ${activeTab === 'inspections' ? 'border-green-500 bg-green-50 text-green-900' : 'border-transparent bg-gray-100 text-gray-500'}`}
          onClick={() => setActiveTab('inspections')}
        >
          Inspections
        </button>
      </div>

      {/* Auctions Viewer */}
      {activeTab === 'auctions' && (
        <div className="mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
              <div className="text-lg font-semibold text-yellow-900">
                🏷️ Auctions on {new Date(selectedAuctionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} (IST): <span className="text-yellow-800">{auctionsToday.length}</span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={selectedAuctionDate}
                  onChange={(e) => setSelectedAuctionDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
                <select
                  value={selectedAuctionState}
                  onChange={e => setSelectedAuctionState(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="Gujarat">Gujarat</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            {auctionsLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-yellow-600"></div>
              </div>
            ) : auctionsToday.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-yellow-100 border border-yellow-200 rounded-lg">
                  <thead>
                    <tr className="text-yellow-900 text-left">
                      <th className="py-2 px-3 font-semibold">ID</th>
                      <th className="py-2 px-3 font-semibold">Name</th>
                      <th className="py-2 px-3 font-semibold">Auction Date</th>
                      <th className="py-2 px-3 font-semibold">Location</th>
                      <th className="py-2 px-3 font-semibold">State</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                      <th className="py-2 px-3 font-semibold">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auctionsToday.map((a) => (
                      <tr key={a.id} className="border-t border-yellow-200 hover:bg-yellow-50 transition">
                        <td className="py-2 px-3 text-xs text-gray-700">{a.id}</td>
                        <td className="py-2 px-3 font-medium text-yellow-900">{a.name || a.id}</td>
                        <td className="py-2 px-3">{a.AuctionDate}</td>
                        <td className="py-2 px-3">{a.location}</td>
                        <td className="py-2 px-3">{a.state}</td>
                        <td className="py-2 px-3">{a.status}</td>
                        <td className="py-2 px-3">
                          <a
                            href={`/properties/${a.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800 text-sm"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-yellow-800 text-sm">No auctions scheduled for today.</div>
            )}
          </div>
        </div>
      )}

      {/* Inspections Viewer */}
      {activeTab === 'inspections' && <InspectionsTodayTable />}
    </section>
  );
}

function InspectionsTodayTable() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInspectionDate, setSelectedInspectionDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  });
  const [selectedInspectionState, setSelectedInspectionState] = useState('Gujarat');
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`/api/admin/inspections-today?date=${selectedInspectionDate}&state=${encodeURIComponent(selectedInspectionState)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setInspections(data.inspections || []);
        setLoading(false);
      });
  }, [selectedInspectionDate, selectedInspectionState]);
  if (loading) return null;
  return (
    <div className="mb-8 mt-10">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
          <div className="text-lg font-semibold text-green-900">
            🕵️ Inspections on {new Date(selectedInspectionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} (IST): <span className="text-green-800">{inspections.length}</span>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={selectedInspectionDate}
              onChange={(e) => setSelectedInspectionDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
            <select
              value={selectedInspectionState}
              onChange={e => setSelectedInspectionState(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="Gujarat">Gujarat</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Delhi">Delhi</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        {inspections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-green-100 border border-green-200 rounded-lg">
              <thead>
                <tr className="text-green-900 text-left">
                  <th className="py-2 px-3 font-semibold">ID</th>
                  <th className="py-2 px-3 font-semibold">Name</th>
                  <th className="py-2 px-3 font-semibold">Inspection Date</th>
                  <th className="py-2 px-3 font-semibold">Location</th>
                  <th className="py-2 px-3 font-semibold">State</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold">View</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((a) => (
                  <tr key={a.id} className="border-t border-green-200 hover:bg-green-50 transition">
                    <td className="py-2 px-3 text-xs text-gray-700">{a.id}</td>
                    <td className="py-2 px-3 font-medium text-green-900">{a.name || a.id}</td>
                    <td className="py-2 px-3">{a.inspectionDate}</td>
                    <td className="py-2 px-3">{a.location}</td>
                    <td className="py-2 px-3">{a.state}</td>
                    <td className="py-2 px-3">{a.status}</td>
                    <td className="py-2 px-3">
                      <a
                        href={`/properties/${a.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800 text-sm"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-green-800 text-sm">No inspections scheduled for today.</div>
        )}
      </div>
    </div>
  );
}
