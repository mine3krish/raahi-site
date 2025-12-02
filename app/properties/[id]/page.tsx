"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Calendar, Home, IndianRupee, FileText, Heart, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import ShareButton from "@/components/ui/ShareButton";
import { formatIndianPrice } from "@/lib/constants";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const inWishlist = property ? isInWishlist(property.id) : false;

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}`);
        
        if (!response.ok) {
          throw new Error("Property not found");
        }

        const data = await response.json();
        setProperty(data.property);
      } catch (err: any) {
        setError(err.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h1>
        <p className="text-gray-600 mb-6">{error || "The property you're looking for doesn't exist"}</p>
        <button
          onClick={() => router.push("/properties")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  // AuctionDate is stored as string (DD-MM-YYYY format)
  const auctionDate = property.AuctionDate;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl overflow-hidden "
            >
              {/* Main Image */}
              <div className="relative h-96 bg-gray-200">
                <Image
                  src={property.images[selectedImage] || "/image.png"}
                  alt={property.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                  #{property.id}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <ShareButton
                    propertyId={property.id}
                    propertyName={property.name}
                    location={property.location}
                    price={formatIndianPrice(property.reservePrice)}
                    image={property.images[0] || "/image.png"}
                    compact
                    propertyType={property.type}
                    emd={formatIndianPrice(property.EMD)}
                    auctionDate={property.AuctionDate}
                    state={property.state}
                    area={property.area?.toString()}
                    assetAddress={property.assetAddress}
                  />
                  <button
                    onClick={() => toggleWishlist(property.id)}
                    disabled={wishlistLoading}
                    className={`p-3 rounded-full transition-all ${
                      inWishlist 
                        ? "bg-red-500 text-white" 
                        : "bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    <Heart 
                      size={24} 
                      fill={inWishlist ? "currentColor" : "none"}
                      strokeWidth={2}
                    />
                  </button>
                </div>
              </div>

              {/* Image Thumbnails */}
              {property.images && property.images.length > 1 && (
                <div className="p-4 flex gap-3 overflow-x-auto">
                  {property.images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index ? "border-blue-600" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Property ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Property Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 mt-6 "
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{property.name}</h1>
              
              <div className="flex items-start text-gray-600 mb-6">
                <MapPin size={20} className="mr-2 mt-1 flex-shrink-0" />
                <span>{property.location}, {property.state}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-1">
                    <Home size={16} className="mr-1" />
                    <span className="text-xs">Type</span>
                  </div>
                  <p className="font-semibold text-gray-800">{property.type}</p>
                </div>

                {property.area && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-600 mb-1">
                      <span className="text-xs">Area</span>
                    </div>
                    <p className="font-semibold text-gray-800">{property.area.toLocaleString()} sq ft</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-1">
                    <span className="text-xs">Status</span>
                  </div>
                  <p className={`font-semibold ${
                    property.status === "Active" ? "text-green-600" :
                    property.status === "Sold" ? "text-red-600" : "text-yellow-600"
                  }`}>
                    {property.status}
                  </p>
                </div>

                {property.featured && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Featured</p>
                    <p className="font-semibold text-blue-700">★ Premium</p>
                  </div>
                )}
              </div>

              {property.assetAddress && (
                <div className="border border-gray-200 bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center text-gray-700 mb-2">
                    <MapPin size={18} className="mr-2" />
                    <span className="font-semibold">Asset Address</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {console.log(property)}
                    {property.assetAddress == "Property Details" ? property.location : property.assetAddress}
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Auction Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6  sticky top-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Auction Details</h2>

              {/* Reserve Price */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Reserve Price</p>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-blue-600">
                    {formatIndianPrice(property.reservePrice)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ₹{property.reservePrice.toLocaleString('en-IN')}
                </p>
              </div>

              {/* EMD */}
              <div className="mb-6 pb-6 border-b">
                <p className="text-sm text-gray-600 mb-1">Earnest Money Deposit (EMD)</p>
                <p className="text-xl font-bold text-gray-800">
                  ₹{property.EMD.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Auction Date */}
              <div className="mb-6">
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar size={18} className="mr-2" />
                  <span className="text-sm font-medium">Auction Date</span>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {auctionDate}
                </p>
                {property.auctionStartDate && (
                  <p className="text-sm text-gray-600 mt-1">
                    Start: {property.auctionStartDate}
                  </p>
                )}
                {property.auctionEndTime && (
                  <p className="text-sm text-gray-600">
                    End: {property.auctionEndTime}
                  </p>
                )}
              </div>

              {/* Application Deadline */}
              {property.applicationSubmissionDate && (
                <div className="mb-6 bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center text-orange-700 mb-2">
                    <Calendar size={18} className="mr-2" />
                    <span className="text-sm font-semibold">Application Deadline</span>
                  </div>
                  <p className="text-sm text-orange-900">
                    {property.applicationSubmissionDate}
                  </p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="space-y-3 mb-6">
                <a href="tel:+918488848874" className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center">
                  +91 84888 48874
                </a>
                <a href="https://wa.me/918488848874" target="_blank" rel="noopener noreferrer" className="block w-full border-2 border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition text-center">
                  WhatsApp Us
                </a>
              </div>

              {/* Additional Details */}
              <div className="border-t pt-4 space-y-4 text-sm">
                {property.assetCategory && (
                  <div>
                    <span className="text-gray-600">Asset Category:</span>
                    <p className="font-medium text-gray-800">{property.assetCategory}</p>
                  </div>
                )}
                {property.publicationDate && (
                  <div>
                    <span className="text-gray-600">Publication Date:</span>
                    <p className="font-medium text-gray-800">{property.publicationDate}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
