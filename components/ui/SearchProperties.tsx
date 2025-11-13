"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/constants";

interface FilterState {
  search: string;
  state: string;
  type: string;
}

const DEBOUNCE_DELAY = 500; // 500ms delay for search

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    state: searchParams.get("state") || "",
    type: searchParams.get("type") || "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch available states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch("/api/properties/states");
        const data = await response.json();
        setAvailableStates(data.states || []);
      } catch (err) {
        console.error("Failed to fetch states:", err);
      }
    };
    fetchStates();
  }, []);

  const applyFilters = useCallback((currentFilters: FilterState) => {
    const params = new URLSearchParams();
    if (currentFilters.search) params.set("search", currentFilters.search);
    if (currentFilters.state) params.set("state", currentFilters.state);
    if (currentFilters.type) params.set("type", currentFilters.type);
    // Reset to page 1 when filters change
    params.set("page", "1");
    
    const queryString = params.toString();
    router.push(`/properties${queryString ? `?${queryString}` : ""}`, { scroll: false });
    setIsSearching(false);
  }, [router]);

  const debouncedApplyFilters = useCallback((currentFilters: FilterState) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for search
    setIsSearching(true);
    debounceTimerRef.current = setTimeout(() => {
      applyFilters(currentFilters);
    }, DEBOUNCE_DELAY);
  }, [applyFilters]);

  const handleChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Use debounce only for search, instant for others
    if (key === "search") {
      debouncedApplyFilters(newFilters);
    } else {
      applyFilters(newFilters);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear debounce timer and apply immediately
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    applyFilters(filters);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <section className="w-full bg-white border-gray-200 py-6">
      <div className="mx-auto px-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row items-center gap-4"
        >
          {/* Search */}
          <div className="flex items-center w-full md:flex-1 bg-gray-100 rounded-[4] px-4 py-2 border border-gray-200">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search properties..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
            />
            {isSearching && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 ml-2"></div>
            )}
          </div>

          {/* Filter Toggle (Mobile) */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-[4] text-gray-700 text-sm"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>

          {/* Filters (Desktop + Toggle for Mobile) */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: showFilters || window?.innerWidth >= 768 ? 1 : 0,
              height: showFilters || window?.innerWidth >= 768 ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto overflow-hidden"
          >
            {/* State */}
            <select
              value={filters.state}
              onChange={(e) => handleChange("state", e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-[4] px-4 py-2 text-sm text-gray-700 focus:outline-none"
            >
              <option value="">All States</option>
              {availableStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            {/* Property Type */}
            <select
              value={filters.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-[4] px-4 py-2 text-sm text-gray-700 focus:outline-none"
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {(filters.search || filters.state || filters.type) && (
              <button
                type="button"
                onClick={() => {
                  setFilters({ search: "", state: "", type: "" });
                  router.push("/properties");
                }}
                className="text-gray-600 text-sm px-4 py-2 border border-gray-300 rounded-[4] hover:bg-gray-50 transition"
              >
                Clear
              </button>
            )}
          </motion.div>
        </form>
      </div>
    </section>
  );
}
