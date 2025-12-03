"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function Hero() {
  const router = useRouter();
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (location) params.set("search", location);
    if (propertyType) params.set("type", propertyType);
    
    const queryString = params.toString();
    router.push(`/properties${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <section className="relative bg-[url('/Ahemdabad_Skyline.jpg')] bg-cover bg-center min-h-[85vh] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center text-white px-4 sm:px-6 md:px-8"
      >
        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-snug">
          Find, Bid & Own Your <span className="text-green-300">Dream Property</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 sm:mb-10 max-w-2xl mx-auto">
          Discover verified listings and live property auctions across India.
        </p>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white rounded-2xl flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-2 w-full"
        >
          {/* Property Type */}
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="flex-1 bg-transparent text-gray-700 px-3 py-2 focus:outline-none text-sm sm:text-base"
          >
            <option value="">Property Type</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Land">Land</option>
            <option value="Industrial">Industrial</option>
          </select>

          {/* Divider (Desktop Only) */}
          <div className="hidden sm:block w-px h-6 bg-gray-200" />

          {/* Location */}
          <input
            type="text"
            placeholder="Location, City or State"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 bg-transparent text-gray-700 px-3 py-2 focus:outline-none text-sm sm:text-base"
          />

          {/* Search Button */}
          <button 
            type="submit"
            className="bg-green-600 text-white w-full sm:w-auto mt-2 sm:mt-0 sm:ml-3 px-6 py-2 rounded-full hover:bg-green-700 transition flex justify-center items-center gap-2 text-sm sm:text-base"
          >
            <Search size={18} />
            Search
          </button>
        </motion.form>

        {/* Trust badges */}
        <div className="mt-8 text-gray-300 text-xs sm:text-sm md:text-base">
          Trusted Listings | Secure Bidding | Verified Properties
        </div>
      </motion.div>
    </section>
  );
}
