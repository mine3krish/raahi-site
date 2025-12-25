"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PropertyGrid from "@/components/ui/PropertyGrid";
import PropertyFilters from "@/components/ui/SearchProperties";
import { formatIndianPrice } from "@/lib/constants";

const PAGE_SIZE = 50;

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [placeholderImage, setPlaceholderImage] = useState("/image.png");

  // Fetch placeholder image from settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        if (data.propertyPlaceholderImage) {
          setPlaceholderImage(data.propertyPlaceholderImage);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };

    fetchSettings();
  }, []);

  // Initialize AdSense ads
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [properties]);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        // Get search params from URL
        const search = searchParams.get("search");
        const state = searchParams.get("state");
        const type = searchParams.get("type");
        const page = searchParams.get("page") || "1";
        
        if (search) params.set("search", search);
        if (state) params.set("state", state);
        if (type) params.set("type", type);
        params.set("page", page);
        params.set("limit", PAGE_SIZE.toString());

        const response = await fetch(`/api/properties?${params.toString()}`);
        const data = await response.json();
        
        setProperties(data.properties || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(parseInt(page));
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]);

  // Transform properties to match PropertyCard interface
  const transformedProperties = properties.map(p => {
    const locationParts = [p.location, p.state].filter(Boolean);
    return {
      id: p.id,
      title: p.name,
      location: locationParts.length > 0 ? locationParts.join(', ') : 'Location not specified',
      price: formatIndianPrice(p.reservePrice),
      image: p.images[0] || placeholderImage,
      auctionDate: p.AuctionDate || p.auctionDate,
    };
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/properties?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <PropertyFilters />
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      ) : (
        <>
          <PropertyGrid properties={transformedProperties} total={total} />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                {/* Mobile: Compact layout */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs sm:text-sm transition"
                  >
                    <span className="hidden sm:inline">← Previous</span>
                    <span className="sm:hidden">←</span>
                  </button>
                  
                  {/* Page numbers - hide some on mobile */}
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
                      
                      return (
                        <button
                          key={pageNum}
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
                Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, total)} of {total} properties
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Properties() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  );
}
