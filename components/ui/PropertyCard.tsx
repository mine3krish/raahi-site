"use client";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import ShareButton from "./ShareButton";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
}

export default function PropertyCard({
  id,
  title,
  location,
  price,
  image,
}: PropertyCardProps) {
  const { isInWishlist, toggleWishlist, loading } = useWishlist();
  const inWishlist = isInWishlist(id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  return (
    <Link href={`/properties/${id}`} className="block w-full">
      <div className="w-full max-w-sm border border-gray-200 rounded-xl bg-white transition hover:border-green-400">
        {/* Image Section */}
        <div className="relative w-full h-48">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover rounded-t-xl"
          />
          {/* Listing ID Overlay */}
          <div className="absolute top-3 left-3 bg-white/95 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border-2 border-green-600">
            #{id}
          </div>
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <ShareButton
              propertyId={id}
              propertyName={title}
              location={location}
              price={price}
              image={image}
              compact
            />
            <button
              onClick={handleWishlistClick}
              disabled={loading}
              className={`p-2 rounded-full transition-all ${
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
          <h3 className="text-gray-800 font-semibold text-lg truncate">
            {title}
          </h3>
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <MapPin size={16} className="mr-1" />
            {location}
          </div>
          <p className="text-green-600 font-bold text-lg">{price}</p>
          <button className="mt-4 w-full bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 transition">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}
