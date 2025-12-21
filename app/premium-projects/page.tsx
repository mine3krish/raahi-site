"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PremiumProjectFilters from "@/components/ui/PremiumProjectFilters";
import { formatIndianPrice } from "@/lib/constants";
import PremiumProjectGrid from "@/components/ui/PremiumProjectGrid";

const PAGE_SIZE = 12;


export default function PremiumProjectsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-green-600"></div></div>}>
      <PremiumProjectsPageContent />
    </Suspense>
  );
}

function PremiumProjectsPageContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const search = searchParams.get("search") || "";
        const location = searchParams.get("location") || "";
        const page = parseInt(searchParams.get("page") || "1");

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: PAGE_SIZE.toString(),
        });

        if (search) queryParams.set("search", search);
        if (location) queryParams.set("location", location);

        const response = await fetch(`/api/premium-projects?${queryParams}`);
        const data = await response.json();

        setProjects(data.projects || []);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 0);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching premium projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    window.history.pushState(null, "", `?${params}`);
    setCurrentPage(page);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium Projects</h1>
          <p className="text-xl md:text-2xl mb-8 text-green-100">Discover exclusive premium properties in prime locations</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="bg-white/10 px-4 py-2 rounded-full">✓ Verified Projects</div>
            <div className="bg-white/10 px-4 py-2 rounded-full">✓ Direct from Builders</div>
            <div className="bg-white/10 px-4 py-2 rounded-full">✓ Best Price Guarantee</div>
          </div>
        </div>
      </div>

      <PremiumProjectFilters />
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-green-600"></div>
        </div>
      ) : (
        <>
          <PremiumProjectGrid projects={projects} total={total} />
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs sm:text-sm transition"
                  >
                    <span className="hidden sm:inline">← Previous</span>
                    <span className="sm:hidden">←</span>
                  </button>
                  <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                    {Array.from({ length: Math.min(totalPages <= 5 ? totalPages : 5, totalPages) }, (_, i) => {
                      let pageNum;
                      const mobilePages = 5;
                      if (totalPages <= mobilePages) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - (mobilePages - 1) + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      // Ensure key is always unique and not undefined/null
                      const key = `page-btn-${pageNum}`;
                      return (
                        <button
                          key={key}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2.5 sm:px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition whitespace-nowrap ${
                            currentPage === pageNum
                              ? "bg-green-600 text-white"
                              : "border border-gray-300 bg-white hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs sm:text-sm transition"
                  >
                    <span className="hidden sm:inline">Next →</span>
                    <span className="sm:hidden">→</span>
                  </button>
                </div>
              </div>
              {/* Page Info */}
              <div className="text-center mt-4 text-xs sm:text-sm text-gray-600">
                Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, total)} of {total} premium projects
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}