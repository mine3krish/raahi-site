"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ImportedDataRecord {
  _id: string;
  newListingId?: string;
  schemeName?: string;
  name?: string;
  category?: string;
  state?: string;
  city?: string;
  areaTown?: string;
  date?: string;
  reservePrice?: number;
  emd?: number;
  incrementBid?: string;
  bankName?: string;
  branchName?: string;
  contactDetails?: string;
  description?: string;
  address?: string;
  note?: string;
  borrowerName?: string;
  publishingDate?: string;
  inspectionDate?: string;
  applicationSubmissionDate?: string;
  auctionStartDate?: string;
  auctionEndTime?: string;
  auctionType?: string;
  listingId?: string;
  images?: string;
  notice?: string;
  source?: string;
  url?: string;
  fingerprint?: string;
  importedAt: string;
  importBatchId: string;
  propertyId?: string;
  processed: boolean;
  processingError?: string;
}

interface ImportBatch {
  importBatchId: string;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  errorRecords: number;
  firstImportedAt: string;
  lastImportedAt: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function ImportedDataPage() {
  const [records, setRecords] = useState<ImportedDataRecord[]>([]);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ImportedDataRecord | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [processedFilter, setProcessedFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 50;

  // Fetch batches
  useEffect(() => {
    fetchBatches();
  }, []);

  // Fetch records when filters change
  useEffect(() => {
    fetchRecords();
  }, [page, search, stateFilter, categoryFilter, batchFilter, processedFilter]);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/imported-data/batches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches);
      }
    } catch (err) {
      console.error("Error fetching batches:", err);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
      });

      if (search) params.append("search", search);
      if (stateFilter) params.append("state", stateFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      if (batchFilter) params.append("importBatchId", batchFilter);
      if (processedFilter) params.append("processed", processedFilter);

      const response = await fetch(`/api/admin/imported-data?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch records");
      }

      const data = await response.json();
      setRecords(data.data);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = () => {
    setPage(1);
    fetchRecords();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteBatch = async (batchId: string) => {
    if (!confirm(`Are you sure you want to delete all records from batch ${batchId}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/imported-data?batchId=${batchId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Batch deleted successfully");
        fetchBatches();
        fetchRecords();
      } else {
        alert("Failed to delete batch");
      }
    } catch (err) {
      alert("Error deleting batch");
    }
  };

  return (
    <section className="max-w-[1800px] mx-auto p-6">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-6"
      >
        Imported Data
      </motion.h1>

      {/* Import Batches Summary */}
      {batches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-4 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Import Batches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {batches.map((batch) => (
              <div
                key={batch.importBatchId}
                className="border border-gray-200 rounded-lg p-3 hover:border-green-500 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-mono text-gray-600 truncate flex-1">
                    {batch.importBatchId}
                  </div>
                  <button
                    onClick={() => deleteBatch(batch.importBatchId)}
                    className="text-red-600 hover:text-red-800 text-xs ml-2"
                  >
                    Delete
                  </button>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{batch.totalRecords}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processed:</span>
                    <span className="font-medium text-green-600">{batch.successfulRecords}</span>
                  </div>
                  {batch.errorRecords > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Errors:</span>
                      <span className="font-medium text-red-600">{batch.errorRecords}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(batch.firstImportedAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setBatchFilter(batch.importBatchId);
                    setPage(1);
                  }}
                  className="mt-2 w-full text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                >
                  View Records
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl p-4 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Search by ID, name, fingerprint..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              handleFilterChange();
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">All States</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Category..."
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              handleFilterChange();
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <select
            value={processedFilter}
            onChange={(e) => {
              setProcessedFilter(e.target.value);
              handleFilterChange();
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">All Records</option>
            <option value="true">Processed</option>
            <option value="false">Not Processed</option>
          </select>
          {batchFilter && (
            <button
              onClick={() => {
                setBatchFilter("");
                handleFilterChange();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
            >
              Clear Batch Filter
            </button>
          )}
        </div>
        {(search || stateFilter || categoryFilter || batchFilter || processedFilter) && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {records.length} of {total} records
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">New ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">State</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">City</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reserve Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading records...</p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center text-red-600 py-12">
                  <p className="font-medium">{error}</p>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">
                  No records found. Import data using the Properties Import feature.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    {record.newListingId || record.listingId || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">
                    {record.schemeName || record.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.category || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.state || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.city || "N/A"}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {record.reservePrice ? `₹${record.reservePrice.toLocaleString("en-IN")}` : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {record.processed ? (
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          record.processingError ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}>
                          {record.processingError ? "Error" : "Processed"}
                        </span>
                        {record.propertyId && (
                          <div className="text-xs text-gray-500">ID: {record.propertyId}</div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="text-green-600 hover:text-green-800 font-medium text-sm hover:underline"
                    >
                      View Details
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
      {!loading && records.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-600">
          Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} records
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Record Details</h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(selectedRecord).map(([key, value]) => {
                if (key === "_id" || key === "__v") return null;
                return (
                  <div key={key} className="border-b border-gray-200 pb-2">
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="text-sm text-gray-900 break-words">
                      {value === null || value === undefined || value === ""
                        ? "N/A"
                        : typeof value === "boolean"
                        ? value ? "Yes" : "No"
                        : typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
