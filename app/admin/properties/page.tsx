
"use client";
// Utility: parse AuctionDate in various formats (DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, etc.)
function parseAuctionDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Try ISO first
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  // Try DD/MM/YYYY
  const dmY = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmY) {
    const [_, dd, mm, yyyy] = dmY;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d;
  }
  // Try MM/DD/YYYY
  const mdY = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdY) {
    const [_, mm, dd, yyyy] = mdY;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d;
  }
  // Try YYYY/MM/DD
  const ymd = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymd) {
    const [_, yyyy, mm, dd] = ymd;
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function isToday(date: Date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { INDIAN_STATES, PROPERTY_TYPES, PROPERTY_STATUSES } from "@/lib/constants";

const PAGE_SIZE = 10;

export default function Properties() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [properties, setProperties] = useState<any[]>([]);
  // Compute today's auctions (after properties is defined)
  const todaysAuctions = properties.filter(p => {
    const d = parseAuctionDate(p.AuctionDate);
    return d && isToday(d);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states from URL or default
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [stateFilter, setStateFilter] = useState(searchParams.get("state") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [premiumFilter, setPremiumFilter] = useState(searchParams.get("premium") || "");
  const [featuredFilter, setFeaturedFilter] = useState(searchParams.get("featured") || "");
  const [bestDealFilter, setBestDealFilter] = useState(searchParams.get("bestDeal") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [total, setTotal] = useState(0);
  
  // Multi-select state
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Social share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [socialTemplates, setSocialTemplates] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [shareTemplate, setShareTemplate] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("default");
  const [includeImage, setIncludeImage] = useState(true);
  const [includeLink, setIncludeLink] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [shareResult, setShareResult] = useState<any>(null);
  
  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Update URL with filters
  const updateURL = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.state) params.set("state", filters.state);
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    if (filters.premium) params.set("premium", filters.premium);
    if (filters.featured) params.set("featured", filters.featured);
    if (filters.bestDeal) params.set("bestDeal", filters.bestDeal);
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
        if (premiumFilter) params.set("premium", premiumFilter);
        if (featuredFilter) params.set("featured", featuredFilter);
        if (bestDealFilter) params.set("bestDeal", bestDealFilter);

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
  }, [search, stateFilter, typeFilter, statusFilter, page, premiumFilter, featuredFilter, bestDealFilter]);

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
    updateURL({ search, state: stateFilter, type: typeFilter, status: statusFilter, premium: premiumFilter, featured: featuredFilter, bestDeal: bestDealFilter, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // New filter handlers
  const handlePremiumFilterChange = (value: string) => {
    setPremiumFilter(value);
    setPage(1);
    updateURL({ search, state: stateFilter, type: typeFilter, status: statusFilter, premium: value, featured: featuredFilter, bestDeal: bestDealFilter, page: 1 });
  };
  const handleFeaturedFilterChange = (value: string) => {
    setFeaturedFilter(value);
    setPage(1);
    updateURL({ search, state: stateFilter, type: typeFilter, status: statusFilter, premium: premiumFilter, featured: value, bestDeal: bestDealFilter, page: 1 });
  };
  const handleBestDealFilterChange = (value: string) => {
    setBestDealFilter(value);
    setPage(1);
    updateURL({ search, state: stateFilter, type: typeFilter, status: statusFilter, premium: premiumFilter, featured: featuredFilter, bestDeal: value, page: 1 });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Handle import
  const handleImport = async () => {
    if (!excelFile) {
      alert("Please select an Excel file");
      return;
    }
    
    setImporting(true);
    setImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append("excel", excelFile);
      if (zipFile) {
        formData.append("images", zipFile);
      }
      
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/properties/import", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }
      
      setImportResult(data);
      
      // Refresh properties list after successful import
      if (data.results?.success > 0) {
        // Trigger refetch by updating a filter temporarily
        setSearch((prev) => prev);
      }
    } catch (err: any) {
      setImportResult({
        error: err.message || "Failed to import properties"
      });
    } finally {
      setImporting(false);
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setExcelFile(null);
    setZipFile(null);
    setImportResult(null);
  };

  // Multi-select handlers
  const toggleSelectAll = () => {
    if (selectedProperties.size === properties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(properties.map(p => p.id)));
    }
  };

  const toggleSelectProperty = (propertyId: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
    } else {
      newSelected.add(propertyId);
    }
    setSelectedProperties(newSelected);
  };

  // Bulk delete action
  const handleBulkDelete = async () => {
    if (selectedProperties.size === 0) return;
    
    const confirmed = confirm(`Are you sure you want to delete ${selectedProperties.size} selected properties? This action cannot be undone.`);
    if (!confirmed) return;

    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const deletePromises = Array.from(selectedProperties).map(propertyId =>
        fetch(`/api/admin/properties/${propertyId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(r => r.status === "fulfilled" && (r.value as Response).ok).length;
      const failCount = results.length - successCount;

      alert(`Successfully deleted ${successCount} properties${failCount > 0 ? `. Failed: ${failCount}` : ''}`);
      
      setSelectedProperties(new Set());
      setShowBulkActions(false);
      
      // Refresh the list
      setSearch((prev) => prev);
    } catch (err: any) {
      alert(err.message || "Failed to delete properties");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk status change
  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedProperties.size === 0) return;

    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/properties/bulk-update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyIds: Array.from(selectedProperties),
          updates: { status: newStatus },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update properties");
      }

      const data = await response.json();
      alert(`Successfully updated ${data.updated} properties to ${newStatus}`);
      
      // Update local state
      setProperties(prev => 
        prev.map(p => selectedProperties.has(p.id) ? { ...p, status: newStatus } : p)
      );
      
      setSelectedProperties(new Set());
      setShowBulkActions(false);
    } catch (err: any) {
      alert(err.message || "Failed to update properties");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk feature updates
  const handleBulkFeatureUpdate = async (field: "featured" | "bestDeal" | "premium", value: boolean) => {
    if (selectedProperties.size === 0) return;

    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/properties/bulk-update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyIds: Array.from(selectedProperties),
          updates: { [field]: value },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update properties");
      }

      const data = await response.json();
      const fieldName = field === "bestDeal" ? "Best Deal" : field === "premium" ? "Premium" : "Featured";
      alert(`Successfully updated ${data.updated} properties - ${fieldName}: ${value ? "enabled" : "disabled"}`);
      
      // Update local state
      setProperties(prev => 
        prev.map(p => selectedProperties.has(p.id) ? { ...p, [field]: value } : p)
      );
      
      setSelectedProperties(new Set());
      setShowBulkActions(false);
    } catch (err: any) {
      alert(err.message || "Failed to update properties");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Open share modal
  const openShareModal = async () => {
    if (selectedProperties.size === 0) {
      alert("Please select at least one property to share");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/social-config", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch social accounts");

      const data = await response.json();
      setSocialAccounts(data.config?.accounts?.filter((a: any) => a.enabled) || []);
      setSocialTemplates(data.config?.templates || []);
      setShareTemplate(data.config?.defaultTemplate || "");
      setSelectedTemplateId("default");
      setShowShareModal(true);
      setShareResult(null);
    } catch (err: any) {
      alert(err.message || "Failed to load social accounts");
    }
  };

  // Handle social share
  const handleSocialShare = async () => {
    if (selectedAccounts.size === 0) {
      alert("Please select at least one social account");
      return;
    }

    setSharing(true);
    setShareResult(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/social-share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyIds: Array.from(selectedProperties),
          accountIds: Array.from(selectedAccounts),
          template: shareTemplate,
          includeImage,
          includeLink,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to share properties");
      }

      setShareResult(data);
    } catch (err: any) {
      setShareResult({
        error: err.message || "Failed to share properties",
      });
    } finally {
      setSharing(false);
    }
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedAccounts(new Set());
    setShareResult(null);
  };

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
          {selectedProperties.size > 0 && (
            <span className="ml-3 text-lg font-normal text-green-600">
              ({selectedProperties.size} selected)
            </span>
          )}
        </motion.h1>
        <div className="flex gap-3">
          {selectedProperties.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              Bulk Actions
            </motion.button>
          )}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
            onClick={() => setShowImportModal(true)}
          >
            📤 Import Excel
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition"
            onClick={() => router.push("/admin/properties/new")}
          >
            + Add Property
          </motion.button>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && selectedProperties.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
        >
          <h3 className="font-semibold text-blue-900 mb-4">
            Bulk Actions ({selectedProperties.size} properties selected)
          </h3>
          
          {/* Status Updates */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Status Updates</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkStatusChange("Active")}
                disabled={bulkActionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 text-sm"
              >
                Mark as Active
              </button>
              <button
                onClick={() => handleBulkStatusChange("Sold")}
                disabled={bulkActionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 text-sm"
              >
                Mark as Sold
              </button>
              <button
                onClick={() => handleBulkStatusChange("Pending")}
                disabled={bulkActionLoading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition disabled:opacity-50 text-sm"
              >
                Mark as Pending
              </button>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Feature Updates</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                onClick={() => handleBulkFeatureUpdate("featured", true)}
                disabled={bulkActionLoading}
                className="px-3 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition disabled:opacity-50 text-sm flex items-center justify-center gap-1"
              >
                ⭐ Enable Featured
              </button>
              <button
                onClick={() => handleBulkFeatureUpdate("featured", false)}
                disabled={bulkActionLoading}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition disabled:opacity-50 text-sm flex items-center justify-center gap-1"
              >
                ⭐ Disable Featured
              </button>
              <button
                onClick={() => handleBulkFeatureUpdate("bestDeal", true)}
                disabled={bulkActionLoading}
                className="px-3 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50 text-sm flex items-center justify-center gap-1"
              >
                🔥 Enable Best Deal
              </button>
              <button
                onClick={() => handleBulkFeatureUpdate("bestDeal", false)}
                disabled={bulkActionLoading}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition disabled:opacity-50 text-sm flex items-center justify-center gap-1"
              >
                🔥 Disable Best Deal
              </button>
              <button
                onClick={() => handleBulkFeatureUpdate("premium", true)}
                disabled={bulkActionLoading}
                className="px-3 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition disabled:opacity-50 text-sm flex items-center justify-center gap-1"
              >
                💎 Enable Premium
              </button>
              <button
                onClick={() => handleBulkFeatureUpdate("premium", false)}
                disabled={bulkActionLoading}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition disabled:opacity-50 text-sm flex items-center justify-center gap-1"
              >
                💎 Disable Premium
              </button>
            </div>
          </div>

          {/* Other Actions */}
          <div className="mb-2">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Other Actions</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={openShareModal}
                disabled={bulkActionLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 text-sm"
              >
                📤 Share to Social Media
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-4 py-2 bg-red-700 text-white rounded-lg font-medium hover:bg-red-800 transition disabled:opacity-50 text-sm"
              >
                🗑️ Delete Selected
              </button>
              <button
                onClick={() => {
                  setSelectedProperties(new Set());
                  setShowBulkActions(false);
                }}
                disabled={bulkActionLoading}
                className="px-4 py-2 border border-gray-300 bg-white rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-4 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          <input
            type="text"
            placeholder="Search by name, ID, location..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <select
            value={stateFilter}
            onChange={(e) => handleStateChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">All States</option>
            {INDIAN_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">All Statuses</option>
            {PROPERTY_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={premiumFilter === "true"}
              onChange={e => {
                const value = e.target.checked ? "true" : "";
                handlePremiumFilterChange(value);
              }}
              className="accent-green-600"
            />
            <span>Premium Only</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={featuredFilter === "true"}
              onChange={e => {
                const value = e.target.checked ? "true" : "";
                handleFeaturedFilterChange(value);
              }}
              className="accent-green-600"
            />
            <span>Featured Only</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={bestDealFilter === "true"}
              onChange={e => {
                const value = e.target.checked ? "true" : "";
                handleBestDealFilterChange(value);
              }}
              className="accent-green-600"
            />
            <span>Best Deal Only</span>
          </label>
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
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={properties.length > 0 && selectedProperties.size === properties.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
              </th>
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
                <td colSpan={9} className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading properties...</p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="text-center text-red-600 py-12">
                  <p className="font-medium">{error}</p>
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-500">
                  No properties found. Try adjusting your filters or add a new property.
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id || property._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProperties.has(property.id)}
                      onChange={() => toggleSelectProperty(property.id)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{property.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{property.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{property.location}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{property.state}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {property.type}
                    </span>
                    <div className="flex gap-1 mt-1">
                      {property.featured && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐
                        </span>
                      )}
                      {property.bestDeal && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          🔥
                        </span>
                      )}
                      {property.premium && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          💎
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={property.status}
                      onChange={(e) => handleStatusChange(property.id, e.target.value)}
                      className={`border rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
                    <div className="flex gap-2">
                      <button
                        className="text-green-600 hover:text-green-800 font-medium text-sm hover:underline"
                        onClick={() => router.push(`/admin/properties/${property.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 font-medium text-sm hover:underline"
                        onClick={async () => {
                          if (!confirm(`Are you sure you want to delete "${property.name}"?`)) return;
                          try {
                            const token = localStorage.getItem("token");
                            const response = await fetch(`/api/admin/properties/${property.id}`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (response.ok) {
                              setProperties(prev => prev.filter(p => p.id !== property.id));
                              setTotal(prev => prev - 1);
                            } else {
                              const error = await response.json();
                              alert(`Failed to delete: ${error.error || 'Unknown error'}`);
                            }
                          } catch (err) {
                            alert("Failed to delete property. Please try again.");
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
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
                      ? "bg-green-600 text-white"
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Import Properties from Excel</h2>
            
            {!importResult ? (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excel File <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload Excel file with property details
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images ZIP (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload ZIP file containing property images (jpg, png, webp)
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-green-900 mb-2">Excel Format Requirements:</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• <strong>Required columns:</strong> type, location, state, reservePrice, AuctionDate</li>
                    <li>• <strong>Optional columns:</strong> schemaName (custom name), newListingId (custom ID), EMD, area, images (filenames), description, notice</li>
                    <li>• Images column should contain filenames separated by commas (e.g., "img1.jpg, img2.png")</li>
                    <li>• If schemaName is provided, it will be used as the property name</li>
                    <li>• Otherwise, AI will generate a name based on description, type, and location</li>
                    <li>• If newListingId is not provided, a random ID will be generated</li>
                  </ul>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeImportModal}
                    disabled={importing}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing || !excelFile}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Importing...
                      </>
                    ) : (
                      "Import Properties"
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {importResult.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 mb-2">Import Failed</h3>
                      <p className="text-red-800">{importResult.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-900 mb-2">Import Summary</h3>
                        <div className="text-sm text-green-800 space-y-1">
                          <p>✓ Successfully imported: <strong>{importResult.results.success}</strong> properties</p>
                          {importResult.results.duplicates > 0 && (
                            <p>⚠ Duplicates skipped: <strong>{importResult.results.duplicates}</strong></p>
                          )}
                          {importResult.results.failed > 0 && (
                            <p>✗ Failed: <strong>{importResult.results.failed}</strong></p>
                          )}
                        </div>
                      </div>
                      
                      {importResult.results.errors.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                          <h3 className="font-semibold text-yellow-900 mb-2">Errors & Warnings:</h3>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            {importResult.results.errors.map((error: string, idx: number) => (
                              <li key={idx}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={closeImportModal}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Social Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Share {selectedProperties.size} {selectedProperties.size === 1 ? "Property" : "Properties"} to Social Media
            </h2>

            {!shareResult ? (
              <>
                {socialAccounts.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-yellow-900 mb-2">No Social Accounts Configured</h3>
                    <p className="text-yellow-800 mb-4">
                      You need to configure at least one social media account before sharing properties.
                    </p>
                    <button
                      onClick={() => router.push("/admin/social-sharing")}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition"
                    >
                      Configure Social Accounts
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">Select Social Accounts</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {socialAccounts.map((account, index) => (
                          <label
                            key={index}
                            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 cursor-pointer transition"
                          >
                            <input
                              type="checkbox"
                              checked={selectedAccounts.has(index.toString())}
                              onChange={() => {
                                const newSelected = new Set(selectedAccounts);
                                if (newSelected.has(index.toString())) {
                                  newSelected.delete(index.toString());
                                } else {
                                  newSelected.add(index.toString());
                                }
                                setSelectedAccounts(newSelected);
                              }}
                              className="w-5 h-5 text-green-600"
                            />
                            <div>
                              <p className="font-medium text-gray-800">{account.name}</p>
                              <p className="text-sm text-gray-600 capitalize">{account.platform}</p>
                              {account.platform === "whatsapp" && account.config.groups && (
                                <p className="text-xs text-gray-500">
                                  {account.config.groups.filter((g: any) => g.enabled).length} groups
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">Post Template</h3>
                      
                      {socialTemplates.length > 0 && (
                        <div className="mb-3">
                          <select
                            value={selectedTemplateId}
                            onChange={(e) => {
                              setSelectedTemplateId(e.target.value);
                              if (e.target.value === "default") {
                                const token = localStorage.getItem("token");
                                fetch("/api/admin/social-config", {
                                  headers: { Authorization: `Bearer ${token}` },
                                })
                                  .then(res => res.json())
                                  .then(data => {
                                    setShareTemplate(data.config?.defaultTemplate || "");
                                    setIncludeImage(true);
                                    setIncludeLink(true);
                                  });
                              } else {
                                const template = socialTemplates.find((t, idx) => idx.toString() === e.target.value);
                                if (template) {
                                  setShareTemplate(template.template);
                                  setIncludeImage(template.includeImage !== false);
                                  setIncludeLink(template.includeLink !== false);
                                }
                              }
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                          >
                            <option value="default">📋 Default Template</option>
                            {socialTemplates.map((template, index) => (
                              <option key={index} value={index.toString()}>
                                {template.platform === "whatsapp" ? "💬" : template.platform === "facebook" ? "📘" : template.platform === "linkedin" ? "💼" : "📷"} {template.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <textarea
                        value={shareTemplate}
                        onChange={(e) => setShareTemplate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm font-mono"
                        rows={10}
                        placeholder="Edit your post template here..."
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Variables: {"{"}{"{"} name {"}"}{"}"}, {"{"}{"{"} location {"}"}{"}"}, {"{"}{"{"} state {"}"}{"}"}, {"{"}{"{"} reservePrice {"}"}{"}"}, {"{"}{"{"} auctionDate {"}"}{"}"}, {"{"}{"{"} area {"}"}{"}"}, {"{"}{"{"} type {"}"}{"}"}, {"{"}{"{"} link {"}"}{"}"}
                      </p>
                      
                      <div className="flex gap-4 mt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeImage}
                            onChange={(e) => setIncludeImage(e.target.checked)}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm text-gray-700">Include Image</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeLink}
                            onChange={(e) => setIncludeLink(e.target.checked)}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm text-gray-700">Include Link</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-blue-900 mb-2">What will happen?</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Each of the {selectedProperties.size} selected properties will be shared</li>
                        <li>• Posts will be sent to {selectedAccounts.size} selected accounts</li>
                        <li>• Property images will be included (if available)</li>
                        <li>• Total posts to be created: {selectedProperties.size * selectedAccounts.size}</li>
                      </ul>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeShareModal}
                    disabled={sharing}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  {socialAccounts.length > 0 && (
                    <button
                      onClick={handleSocialShare}
                      disabled={sharing || selectedAccounts.size === 0}
                      className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {sharing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Sharing...
                        </>
                      ) : (
                        "📤 Share Properties"
                      )}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {shareResult.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 mb-2">Sharing Failed</h3>
                      <p className="text-red-800">{shareResult.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-900 mb-2">Sharing Summary</h3>
                        <div className="text-sm text-green-800 space-y-1">
                          <p>✓ Successfully shared: <strong>{shareResult.summary.success}</strong> posts</p>
                          {shareResult.summary.failed > 0 && (
                            <p>✗ Failed: <strong>{shareResult.summary.failed}</strong> posts</p>
                          )}
                        </div>
                      </div>

                      {shareResult.errors && shareResult.errors.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                          <h3 className="font-semibold text-yellow-900 mb-2">Errors:</h3>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            {shareResult.errors.map((error: string, idx: number) => (
                              <li key={idx}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {shareResult.results && shareResult.results.length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                          <h3 className="font-semibold text-gray-800 mb-3">Detailed Results:</h3>
                          <div className="space-y-2">
                            {shareResult.results.map((result: any, idx: number) => (
                              <div
                                key={idx}
                                className={`text-sm p-3 rounded-lg ${
                                  result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                                }`}
                              >
                                <p className="font-medium">
                                  {result.success ? "✓" : "✗"} {result.property} → {result.account} ({result.platform})
                                </p>
                                {result.error && (
                                  <p className="text-xs mt-1">{result.error}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={closeShareModal}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
}

