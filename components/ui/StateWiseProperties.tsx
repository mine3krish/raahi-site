"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Building2, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface StatePropertyCount {
  state: string;
  count: number;
  featured: number;
}

export default function StateWiseProperties() {
  const [stateData, setStateData] = useState<StatePropertyCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStateWiseData = async () => {
      try {
        const res = await fetch("/api/properties/by-state");
        if (res.ok) {
          const data = await res.json();
          // Sort by count descending and take top states
          const sorted = data.states.sort((a: StatePropertyCount, b: StatePropertyCount) => b.count - a.count);
          setStateData(sorted);
        }
      } catch (error) {
        console.error("Error fetching state-wise data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStateWiseData();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
        </div>
      </section>
    );
  }

  if (stateData.length === 0) {
    return null;
  }

  return (
    <section className="pb-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* State Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stateData.map((item, index) => (
            <motion.div
              key={item.state}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/properties?state=${encodeURIComponent(item.state)}`}
                className="group block bg-white rounded-2xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-green-500"
              >
                {/* State Name with Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-600 transition-colors">
                      <MapPin className="text-green-600 group-hover:text-white transition-colors" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                        {item.state}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Property Count */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 size={18} />
                      <span className="text-sm font-medium">Total Properties</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                  </div>

                  {item.featured > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-yellow-600">
                        <TrendingUp size={18} />
                        <span className="text-sm font-medium">Featured</span>
                      </div>
                      <span className="text-lg font-bold text-yellow-600">{item.featured}</span>
                    </div>
                  )}
                </div>

                {/* View Link */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-green-600 group-hover:text-green-700">
                    View Properties
                  </span>
                  <ArrowRight 
                    className="text-green-600 group-hover:translate-x-1 transition-transform" 
                    size={20} 
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold text-lg"
          >
            View All Properties
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
