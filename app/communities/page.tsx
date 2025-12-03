"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, MessageCircle, MapPin, Search } from "lucide-react";
import Link from "next/link";
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
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCommunities();
  }, [stateFilter]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stateFilter) params.set("state", stateFilter);

      const response = await fetch(`/api/communities?${params.toString()}`);
      const data = await response.json();
      setCommunities(data.communities || []);
    } catch (err) {
      console.error("Failed to fetch communities:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group communities by state
  const groupedCommunities = communities.reduce((acc, community) => {
    if (!acc[community.state]) {
      acc[community.state] = [];
    }
    acc[community.state].push(community);
    return acc;
  }, {} as Record<string, Community[]>);

  const filteredStates = Object.keys(groupedCommunities).filter((state) => {
    if (search === "") return true;
    return state.toLowerCase().includes(search.toLowerCase()) ||
      groupedCommunities[state].some(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
      );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Join Our Communities
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-green-100 max-w-2xl mx-auto"
          >
            Connect with property investors and enthusiasts across India. Share insights, discuss opportunities, and grow together.
          </motion.p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-gray-200 py-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center bg-gray-100 border border-gray-200 rounded-lg px-4 py-2">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search communities or states..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="md:w-64 border border-gray-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">All States</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Communities Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : filteredStates.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">No communities found</p>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredStates.map((state) => (
                <motion.div
                  key={state}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* State Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="text-green-600" size={24} />
                    <h2 className="text-2xl font-bold text-gray-800">{state}</h2>
                    <span className="text-sm text-gray-500">
                      ({groupedCommunities[state].length} {groupedCommunities[state].length === 1 ? 'community' : 'communities'})
                    </span>
                  </div>

                  {/* Communities Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedCommunities[state]
                      .filter(c => 
                        search === "" || 
                        c.name.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((community) => (
                      <div
                        key={community._id}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden transition group"
                      >
                        {/* Image */}
                        {community.image ? (
                          <div className="relative h-48 bg-gray-200">
                            <img
                              src={community.image}
                              alt={community.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                            <Users size={48} className="text-white opacity-50" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition">
                            {community.name}
                          </h3>

                          {community.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {community.description}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Users size={16} />
                              <span>{community.memberCount} members</span>
                            </div>
                          </div>

                          {/* Join Button */}
                          <a
                            href={community.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition"
                          >
                            <MessageCircle size={20} />
                            Join WhatsApp Community
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Don't see your community?</h2>
          <p className="text-green-100 mb-6">
            Help us grow by suggesting a new community for your area
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}

