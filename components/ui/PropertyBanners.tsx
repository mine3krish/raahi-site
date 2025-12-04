"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Banner {
  image: string;
  link: string;
  alt: string;
  order: number;
}

export default function PropertyBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          const bannersList = data.propertyBanners || [];
          setBanners(bannersList.sort((a: Banner, b: Banner) => a.order - b.order).slice(0, 2));
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    
    fetchBanners();
  }, []);

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {banners.map((banner, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
        >
          {banner.link ? (
            <a
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={banner.image}
                alt={banner.alt}
                className="w-full h-auto object-cover"
              />
            </a>
          ) : (
            <div className="rounded-lg overflow-hidden shadow-md">
              <img
                src={banner.image}
                alt={banner.alt}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
