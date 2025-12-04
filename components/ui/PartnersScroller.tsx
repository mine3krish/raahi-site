"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Partner {
  name: string;
  logo: string;
  order: number;
}

export default function PartnersScroller() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          const partnersList = data.partners || [];
          setPartners(partnersList.sort((a: Partner, b: Partner) => a.order - b.order));
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };
    
    fetchPartners();
  }, []);

  if (partners.length === 0) {
    return null;
  }

  // Duplicate partners multiple times for truly seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners, ...partners, ...partners];

  return (
    <section className="py-16 bg-white border-y border-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Partnered With
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We collaborate with leading organizations to bring you the best auction experience
          </p>
        </div>

        {/* Scrolling Container */}
        <div className="relative overflow-hidden">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Scrolling logos */}
          <motion.div
            className="flex gap-12 items-center"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: partners.length * 3,
                ease: "linear",
              },
            }}
          >
            {duplicatedPartners.map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-40 h-24 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-auto object-contain"
                  title={partner.name}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
