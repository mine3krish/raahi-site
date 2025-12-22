"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Download, Heart } from "lucide-react";
import ShareButton from "./ShareButton";
import { useWishlist } from "@/context/WishlistContext";

interface Variant {
  type: string;
  propertyType: string;
  area: string;
  areaSqm?: string;
  price: string;
  priceNote?: string;
}

export interface PremiumProjectCardProps {
  id: string;
  name: string;
  location: string;
  description: string;
  price: string;
  images: string[];
  brochure?: string;
  variants?: Variant[];
}

export default function PremiumProjectCard({
  id,
  name,
  location,
  description,
  price,
  images,
  brochure,
  variants = [],
}: PremiumProjectCardProps) {
  const mainImage = images?.[0] || "/image.png";
  const { isInWishlist, toggleWishlist, loading } = useWishlist();
  const inWishlist = isInWishlist(id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  return (
    <Link href={`/premium-projects/${id}`} className="block w-full">
      <div className="w-full max-w-sm border border-gray-200 rounded-xl bg-white transition hover:border-green-400">
        {/* Image Section */}
        <div className="relative w-full h-48">
          <Image
            src={mainImage}
            alt={name}
            fill
            className="object-cover rounded-t-xl"
          />
          {/* Listing ID Overlay */}
          <div className="absolute top-3 left-3 bg-white/95 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border-2 border-green-600">
            #{id}
          </div>
          {/* Image count badge */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {images.length} images
            </div>
          )}
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <ShareButton
              propertyId={id}
              propertyName={name}
              location={location}
              price={price}
              image={mainImage}
              compact
              isPremium
            />
            <button
              onClick={handleWishlistClick}
              disabled={loading}
              className={`p-2 rounded-full transition-colors duration-200 ease-in-out ${
                inWishlist 
                  ? "bg-red-500 text-white" 
                  : "bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart 
                size={18} 
                fill={inWishlist ? "currentColor" : "none"}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-800 font-semibold text-lg truncate flex-1 mr-2">
              {name}
            </h3>
            <span className="text-green-600 font-bold text-lg whitespace-nowrap">{price}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <MapPin size={16} className="mr-1" />
            {location}
          </div>
          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{description}</p>
          {/* Show variants summary */}
          {variants && variants.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 font-semibold mb-1">Available Types:</div>
              <div className="flex flex-wrap gap-1">
                {variants.slice(0, 3).map((v, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {v.type} • {v.price}
                  </span>
                ))}
                {variants.length > 3 && (
                  <span className="text-xs text-gray-500">+{variants.length - 3} more</span>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {brochure && (
                <a
                  href={brochure}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Brochure
                </a>
              )}
            </div>
            <button className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}