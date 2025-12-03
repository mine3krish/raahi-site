"use client";
import { useRef, useState, useEffect } from "react";
import PropertyCard from "./PropertyCard";
import { formatIndianPrice } from "@/lib/constants";

interface Property {
  id: string;
  name: string;
  location: string;
  reservePrice: number;
  images: string[];
  state: string;
}

export default function PropertyScroller() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured properties
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await fetch("/api/properties?featured=true&limit=12");
        const data = await response.json();
        setProperties(data.properties || []);
      } catch (err) {
        console.error("Failed to fetch featured properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  // Calculate total pages dynamically
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const updatePages = () => {
      const visibleWidth = el.clientWidth;
      const totalWidth = el.scrollWidth;
      const pages = Math.ceil(totalWidth / visibleWidth);
      setTotalPages(pages);
    };

    updatePages();
    window.addEventListener("resize", updatePages);
    return () => window.removeEventListener("resize", updatePages);
  }, []);

  // Update current page on scroll
  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentPage(page);
  };

  return (
    <section className="bg-white border-t border-gray-200 py-16 relative">
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Featured Properties
          </h2>
          <a
            href="/properties"
            className="text-green-600 hover:underline text-sm font-medium"
          >
            View All →
          </a>
        </div>

        {/* Scroller Wrapper */}
        <div className="relative">
          {/* Scroller */}
          <div
            ref={scrollerRef}
            onScroll={handleScroll}
            className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          >
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                No featured properties available
              </div>
            ) : (
              <div className="flex gap-6 pb-2">
                {properties.map((p) => (
                  <div key={p.id} className="flex-shrink-0">
                    <PropertyCard
                      id={p.id}
                      title={p.name}
                      location={`${p.location}, ${p.state}`}
                      price={formatIndianPrice(p.reservePrice)}
                      image={p.images[0] || "/image.png"}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Dots */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalPages - 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const el = scrollerRef.current;
                    if (el)
                      el.scrollTo({
                        left: index * el.clientWidth,
                        behavior: "smooth",
                      });
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    index === currentPage
                      ? "bg-green-600 w-3"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
