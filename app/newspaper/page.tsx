"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Download, FileText, Newspaper } from "lucide-react";

export default function NewspaperPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedState, setSelectedState] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [availableStates, setAvailableStates] = useState<string[]>([]);

  // Fetch available states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch("/api/properties/states");
        if (response.ok) {
          const data = await response.json();
          setAvailableStates(data.states || []);
        }
      } catch (err) {
        console.error("Failed to fetch states:", err);
      }
    };
    fetchStates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateNewspaper = async () => {
    setLoading(true);
    setError("");
    setDebugInfo(null);

    try {
      const stateParam = selectedState === "all" ? "" : `&state=${encodeURIComponent(selectedState)}`;
      const response = await fetch(`/api/newspaper?date=${selectedDate}${stateParam}`);

      if (!response.ok) {
        const data = await response.json();
        setDebugInfo(data.debug || null);
        throw new Error(data.error || "Failed to generate newspaper");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = selectedState === "all" 
        ? `raahi-auction-daily-${selectedDate}.pdf`
        : `raahi-auction-${selectedState}-${selectedDate}.pdf`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNewspaper = async () => {
    setLoading(true);
    setError("");
    setDebugInfo(null);

    try {
      const stateParam = selectedState === "all" ? "" : `&state=${encodeURIComponent(selectedState)}`;
      const response = await fetch(`/api/newspaper?date=${selectedDate}${stateParam}`);

      if (!response.ok) {
        const data = await response.json();
        setDebugInfo(data.debug || null);
        throw new Error(data.error || "Failed to generate newspaper");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-12 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <Newspaper size={48} className="text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Daily Auction Newspaper
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Generate a PDF newspaper with all properties listed on a specific date. 
              Perfect for offline reference and sharing with clients.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Date Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="text-gray-400" size={20} />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Select a date to generate newspaper for that day&apos;s property listings
              </p>
            </div>

            {/* State Filter */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All States</option>
                {availableStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Generate newspaper for properties in a specific state
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium mb-2">{error}</p>
                {debugInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer hover:underline">
                      View Debug Info
                    </summary>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleViewNewspaper}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={20} />
                {loading ? "Generating..." : "View Newspaper"}
              </button>

              <button
                onClick={handleGenerateNewspaper}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                {loading ? "Generating..." : "Download PDF"}
              </button>
            </div>

            {/* Info Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Newspaper Features
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Compact Layout</p>
                    <p className="text-sm text-gray-600">
                      Newspaper-style condensed view with 2-column layout
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Complete Information</p>
                    <p className="text-sm text-gray-600">
                      Property ID, location, price, EMD, auction date, and more
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Professional Format</p>
                    <p className="text-sm text-gray-600">
                      Ready-to-print PDF format for offline distribution
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Daily Updates</p>
                    <p className="text-sm text-gray-600">
                      Shows only properties listed on the selected date
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Newspapers are generated on-demand and include all active properties
              listed on the selected date.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
