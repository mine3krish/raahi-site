"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Users, MessageCircle } from "lucide-react";
import { INDIAN_STATES } from "@/lib/constants";

interface Community {
  _id: string;
  id: string;
  name: string;
  description: string;
  state: string;
  image: string;
  memberCount: number;
  whatsappLink: string;
  active: boolean;
  createdAt: string;
}

export default function CommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/communities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCommunities(data.communities || []);
      }
    } catch (err) {
      console.error("Failed to fetch communities:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveStatus = async (communityId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/communities/${communityId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (response.ok) {
        fetchCommunities();
      } else {
        const error = await response.json();
        alert(`Failed to update status: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Failed to update community:", err);
      alert("Failed to update community status. Please try again.");
    }
  };

  const deleteCommunity = async (communityId: string) => {
    if (!confirm("Are you sure you want to delete this community?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/communities/${communityId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchCommunities();
      } else {
        const error = await response.json();
        alert(`Failed to delete community: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Failed to delete community:", err);
      alert("Failed to delete community. Please try again.");
    }
  };

  const filteredCommunities = communities.filter(
    (community) =>
      (community.name.toLowerCase().includes(search.toLowerCase()) ||
        community.state.toLowerCase().includes(search.toLowerCase())) &&
      (stateFilter === "" || community.state === stateFilter)
  );

  if (loading) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Community Management</h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Community Management</h1>
        <button
          onClick={() => router.push("/admin/communities/new")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Add Community
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-4 py-2">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">All States</option>
          {INDIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* Communities Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredCommunities.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-500">No communities found</p>
            <button
              onClick={() => router.push("/admin/communities/new")}
              className="mt-4 text-blue-600 hover:underline"
            >
              Add your first community
            </button>
          </div>
        ) : (
          filteredCommunities.map((community) => (
            <div
              key={community._id}
              className="bg-white border border-gray-200 rounded-xl p-5 transition"
            >
              {/* Image */}
              {community.image && (
                <img
                  src={community.image}
                  alt={community.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}

              {/* Content */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{community.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{community.state}</p>
                {community.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{community.description}</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{community.memberCount} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    community.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {community.active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/communities/${community._id}/edit`)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActiveStatus(community._id, community.active)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  {community.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => deleteCommunity(community._id)}
                  className="px-4 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </motion.div>
    </section>
  );
}
