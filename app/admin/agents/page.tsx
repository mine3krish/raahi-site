"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Phone as PhoneIcon,
  MapPin,
  Award,
  Briefcase,
  Mail,
  ExternalLink,
  X,
  Filter,
} from "lucide-react";
import { INDIAN_STATES } from "@/lib/constants";

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  experience: string;
  licenseNumber?: string;
  portfolio?: string;
  message: string;
  status: "pending" | "approved" | "rejected" | "contacted";
  createdAt: string;
  updatedAt: string;
}

interface Counts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  contacted: number;
}

export default function AdminAgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [counts, setCounts] = useState<Counts>({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    contacted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [searchQuery, statusFilter, stateFilter]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (stateFilter !== "all") params.append("state", stateFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/admin/agents?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      setAgents(data.agents);
      setCounts(data.counts);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/agents/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchAgents();
        if (selectedAgent?._id === id) {
          setSelectedAgent({ ...selectedAgent, status: status as any });
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteAgent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const res = await fetch(`/api/admin/agents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        fetchAgents();
        setShowModal(false);
        setSelectedAgent(null);
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
    }
  };

  const openModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      contacted: "bg-blue-100 text-blue-700 border-blue-200",
    };

    const icons = {
      pending: <Clock size={14} />,
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />,
      contacted: <PhoneIcon size={14} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const statusOptions = [
    { value: "all", label: "All", count: counts.all },
    { value: "pending", label: "Pending", count: counts.pending },
    { value: "contacted", label: "Contacted", count: counts.contacted },
    { value: "approved", label: "Approved", count: counts.approved },
    { value: "rejected", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agent Applications
          </h1>
          <p className="text-gray-600">
            Manage and review agent partnership applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                statusFilter === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">
                {option.count}
              </div>
              <div className="text-sm text-gray-600">{option.label}</div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, email, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All States</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Agents List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No agent applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent) => (
              <motion.div
                key={agent._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
                  agent.status === "pending"
                    ? "border-yellow-200 bg-yellow-50/30"
                    : "border-gray-200"
                }`}
                onClick={() => openModal(agent)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {agent.name}
                      </h3>
                      {getStatusBadge(agent.status)}
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        {agent.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon size={16} />
                        {agent.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {agent.city}, {agent.state}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} />
                        {agent.experience}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {agent.message}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500 flex-shrink-0">
                    {new Date(agent.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && selectedAgent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Agent Application Details
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {["pending", "contacted", "approved", "rejected"].map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            updateStatus(selectedAgent._id, status)
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            selectedAgent.status === status
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Name
                      </label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {selectedAgent.name}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <a
                        href={`mailto:${selectedAgent.email}`}
                        className="mt-1 text-blue-600 hover:underline block"
                      >
                        {selectedAgent.email}
                      </a>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Phone
                      </label>
                      <a
                        href={`tel:${selectedAgent.phone}`}
                        className="mt-1 text-blue-600 hover:underline block"
                      >
                        {selectedAgent.phone}
                      </a>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Location
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedAgent.city}, {selectedAgent.state}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Experience
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedAgent.experience}
                      </p>
                    </div>

                    {selectedAgent.licenseNumber && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          License Number
                        </label>
                        <p className="mt-1 text-gray-900">
                          {selectedAgent.licenseNumber}
                        </p>
                      </div>
                    )}

                    {selectedAgent.portfolio && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">
                          Portfolio/Website
                        </label>
                        <a
                          href={selectedAgent.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-blue-600 hover:underline flex items-center gap-2"
                        >
                          {selectedAgent.portfolio}
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Message
                    </label>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {selectedAgent.message}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500">Applied On</label>
                      <p className="text-gray-900">
                        {new Date(selectedAgent.createdAt).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500">Last Updated</label>
                      <p className="text-gray-900">
                        {new Date(selectedAgent.updatedAt).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => deleteAgent(selectedAgent._id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
                    >
                      <Trash2 size={20} />
                      Delete Application
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
