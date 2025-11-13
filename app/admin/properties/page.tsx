"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { INDIAN_STATES, PROPERTY_TYPES, PROPERTY_STATUSES } from "@/lib/constants";

const PAGE_SIZE = 10;

export default function Properties() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states from URL or default
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [stateFilter, setStateFilter] = useState(searchParams.get("state") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [total, setTotal] = useState(0);

  // Update URL with filters
  const updateURL = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.state) params.set("state", filters.state);
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    if (filters.page > 1) params.set("page", filters.page.toString());
    
    const queryString = params.toString();
    router.push(`/admin/properties${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError("");
      
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (stateFilter) params.set("state", stateFilter);
        if (typeFilter) params.set("type", typeFilter);
        if (statusFilter) params.set("status", statusFilter);
        params.set("page", page.toString());
        params.set("limit", PAGE_SIZE.toString());

        const token = localStorage.getItem("token");
        const response = await fetch(`/api/admin/properties?${params.toString()}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch properties");
        }

        const data = await response.json();
        setProperties(data.properties || data || []);
        setTotal(data.total || data.length || 0);
      } catch (err: any) {
        setError(err.message || "Failed to fetch properties");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [search, stateFilter, typeFilter, statusFilter, page]);

  // Handle status change
  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/properties/${propertyId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      // Update local state
      setProperties(prev => 
        prev.map(p => p.id === propertyId ? { ...p, status: newStatus } : p)
      );
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    updateURL({ search: value, state: stateFilter, type: typeFilter, status: statusFilter, page: 1 });
  };

  const handleStateChange = (value: string) => {
    setStateFilter(value);
    setPage(1);
    updateURL({ search, state: value, type: typeFilter, status: statusFilter, page: 1 });
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
    updateURL({ search, state: stateFilter, type: value, status: statusFilter, page: 1 });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    updateURL({ search, state: stateFilter, type: typeFilter, status: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL({ search, state: stateFilter, type: typeFilter, status: statusFilter, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <section className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-800"
        >
          Properties Management
        </motion.h1>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          onClick={() => router.push("/admin/properties/new")}
        >
          + Add Property
        </motion.button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-4 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by name, ID, location..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <select
            value={stateFilter}
            onChange={(e) => handleStateChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All States</option>
            {INDIAN_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Statuses</option>
            {PROPERTY_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        {(search || stateFilter || typeFilter || statusFilter) && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {properties.length} of {total} properties
          </div>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-x-auto bg-white border border-gray-200 rounded-xl"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">State</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reserve Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading properties...</p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center text-red-600 py-12">
                  <p className="font-medium">{error}</p>
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">
                  No properties found. Try adjusting your filters or add a new property.
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id || property._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{property.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{property.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{property.location}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{property.state}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {property.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={property.status}
                      onChange={(e) => handleStatusChange(property.id, e.target.value)}
                      className={`border rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        property.status === "Active" ? "border-green-300 bg-green-50 text-green-700" :
                        property.status === "Sold" ? "border-red-300 bg-red-50 text-red-700" :
                        "border-yellow-300 bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {PROPERTY_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{property.reservePrice?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                      onClick={() => router.push(`/admin/properties/${property.id}/edit`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center gap-2 mt-6"
        >
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            ← Previous
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                    page === pageNum
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </motion.div>
      )}

      {/* Summary */}
      {!loading && properties.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-600">
          Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} properties
        </div>
      )}
    </section>
  );
}
