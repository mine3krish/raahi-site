"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Calendar, Home, IndianRupee, FileText, Heart, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import ShareButton from "@/components/ui/ShareButton";
import { formatIndianPrice } from "@/lib/constants";
import PropertyCard from "@/components/ui/PropertyCard";
import PropertyBanners from "@/components/ui/PropertyBanners";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProperties, setRelatedProperties] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [defaultPhone, setDefaultPhone] = useState("+91 8488 8488 74");
  const [template, setTemplate] = useState<any>(null);

  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const inWishlist = property ? isInWishlist(property.id) : false;

  // Helper function to check if field should be visible
  const isFieldVisible = (field: string): boolean => {
    const defaultVisible = ['id', 'name', 'location', 'state', 'type', 'reservePrice', 'EMD', 'AuctionDate', 'area', 'images', 'status', 'description', 'address', 'note', 'inspectionDate', 'assetAddress', 'agentMobile', 'youtubeVideo'];
    if (!template || !template.visibleFields) {
      return defaultVisible.includes(field);
    }
    return template.visibleFields[field] === true;
  };

  // Field groups for sections
  const FIELD_GROUPS = {
    'Core Details': [
      'id', 'name', 'location', 'state', 'type', 'status', 'area', 'images', 'featured', 'category', 'assetCategory', 'assetCity', 'publicationDate', 'description', 'note', 'youtubeVideo', 'agentMobile', 'address', 'assetAddress', 'city', 'areaTown', 'contactDetails', 'source', 'url', 'fingerprint'
    ],
    'Auction Details': [
      'reservePrice', 'EMD', 'AuctionDate', 'auctionStartDate', 'auctionEndTime', 'auctionType', 'applicationSubmissionDate', 'inspectionDate', 'publishingDate', 'listingId', 'newListingId', 'schemeName', 'incrementBid', 'notice', 'date'
    ],
    'Bank & Borrower': [
      'bankName', 'branchName', 'borrowerName'
    ]
  };

  // Helper to check if any field in a group is visible
  const isSectionVisible = (fields: string[]) => fields.some(isFieldVisible);

  // Initialize AdSense ads
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && property) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [property]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.whatsappNumber) {
            setDefaultPhone(data.whatsappNumber);
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };

    fetchSettings();

    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}`);
        
        if (!response.ok) {
          throw new Error("Property not found");
        }

        const data = await response.json();
        setProperty(data.property);

        // Fetch template for this property's state
        const templateRes = await fetch(`/api/admin/property-templates?state=${data.property.state || ''}`);
        if (templateRes.ok) {
          const templateData = await templateRes.json();
          setTemplate(templateData.template);
        }

        // Fetch related properties
        const extractCity = (location: string): string => {
          const parts = location.split(',').map(p => p.trim());
          return parts.length >= 2 ? parts[parts.length - 2] : location;
        };
        const city = extractCity(data.property.location);
        const relatedRes = await fetch(`/api/properties?location=${encodeURIComponent(city)}&limit=4`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          // Filter out current property and limit to 4
          const filtered = relatedData.properties.filter((p: any) => p.id !== data.property.id).slice(0, 4);
          setRelatedProperties(filtered);
        }

        // Fetch communities
        const commRes = await fetch(`/api/communities?state=${data.property.state}`);
        if (commRes.ok) {
          const commData = await commRes.json();
          setCommunities(commData.communities.slice(0, 3));
        }
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
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-green-600"></div>
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
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
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
        {/* Back Button: only show if there is navigation history */}
        {typeof window !== 'undefined' && window.history.length > 1 && (
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
        )}

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
                  className="object-contain"
                />
                <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">
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
                    agentMobile={property.agentMobile}
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
                        selectedImage === index ? "border-green-600" : "border-gray-200"
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
                <span>
                  {[property.location, property.state]
                    .filter(part => part && part !== "None")
                    .join(', ') || 'Location not specified'}
                </span>
              </div>


              {/* Field-by-field rendering, including contactDetails, source, url, etc. */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {isFieldVisible('area') && property.area && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-600 mb-1">
                      <span className="text-xs">Area</span>
                    </div>
                    <p className="font-semibold text-gray-800">{property.area.toLocaleString()} sq ft</p>
                  </div>
                )}
                {property.featured && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Featured</p>
                    <p className="font-semibold text-green-700">Premium</p>
                  </div>
                )}
                {isFieldVisible('contactDetails') && property.contactDetails && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs">Contact Details</span>
                    <p className="font-semibold text-gray-800">{property.contactDetails}</p>
                  </div>
                )}
                {isFieldVisible('source') && property.source && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-xs">Source</span>
                    <p className="font-semibold text-gray-800">{property.source}</p>
                  </div>
                )}
                {isFieldVisible('url') && property.url && (
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-1">
                    <span className="text-xs font-semibold mb-1">Official Auction Link</span>
                    <a
                      href={property.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition shadow w-full max-w-full"
                      style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                      title={property.url}
                    >
                      <span className="truncate block" style={{ maxWidth: 180 }}>
                        {property.url.replace(/^https?:\/\//, '')}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H15.75A2.25 2.25 0 0 1 18 8.25v7.5A2.25 2.25 0 0 1 15.75 18h-7.5A2.25 2.25 0 0 1 6 15.75V13.5m6.75-6.75L18 6m0 0v6m0-6H12" />
                      </svg>
                    </a>
                  </div>
                )}
                {/* Add more fields as needed */}
              </div>

              {(isFieldVisible('assetAddress')) && (
                <div className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-white p-5 rounded-xl mb-6 shadow-sm">
                  <div className="flex items-center text-green-800 mb-3">
                    <MapPin size={20} className="mr-2 flex-shrink-0" />
                    <span className="font-bold text-lg">📍 Asset Address</span>
                  </div>
                  <p className="text-base text-gray-800 leading-relaxed font-semibold">
                    {property.assetAddress || property.address || property.location}
                  </p>
                </div>
              )}

              {isFieldVisible('note') && property.note && (
                <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center text-blue-700 mb-2">
                    <span className="font-semibold">📝 Note</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {property.note}
                  </p>
                </div>
              )}

              {isFieldVisible('youtubeVideo') && property.youtubeVideo && (() => {
                let videoId = '';
                const url = property.youtubeVideo;
                
                // Extract video ID from various YouTube URL formats
                if (url.includes('youtube.com/watch?v=')) {
                  videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
                } else if (url.includes('youtu.be/')) {
                  videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
                } else if (url.includes('youtube.com/embed/')) {
                  videoId = url.split('embed/')[1]?.split('?')[0] || '';
                } else {
                  // Assume it's just the video ID
                  videoId = url;
                }
                
                return videoId ? (
                  <div className="border border-red-200 bg-red-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center text-red-700 mb-3">
                      <span className="font-semibold text-lg">🎥 Property Video</span>
                    </div>
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="Property Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ) : null;
              })()}
            </motion.div>

            {/* In-Article Ad */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <div className="bg-gray-50 rounded-lg p-4">
                <ins className="adsbygoogle"
                     style={{ display: 'block', width: '100%', minHeight: '250px' }}
                     data-ad-layout="in-article"
                     data-ad-format="fluid"
                     data-ad-client="ca-pub-7792213399438771"
                     data-ad-slot="3747974443"></ins>
              </div>
            </motion.div>

            {/* Related Properties Section - Shows below property details on desktop */}
            {relatedProperties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 hidden lg:block"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Similar Properties</h2>
                  <Link
                    href={`/properties?state=${property.state}&type=${property.type}`}
                    className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 transition"
                  >
                    View More →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedProperties.map((relatedProp) => (
                    <PropertyCard
                      key={relatedProp.id}
                      id={relatedProp.id}
                      title={relatedProp.name}
                      location={`${relatedProp.location}, ${relatedProp.state}`}
                      price={formatIndianPrice(relatedProp.reservePrice)}
                      image={relatedProp.images[0] || "/image.png"}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Auction Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Auction Details</h2>

              {/* Reserve Price */}
              {isFieldVisible('reservePrice') && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Reserve Price</p>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-green-600">
                      {formatIndianPrice(property.reservePrice)}
                    </span>
                  </div>
                  <p className="text-xl text-gray-500 font-bold mt-1">
                    ₹{property.reservePrice.toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              {/* EMD */}
              {isFieldVisible('EMD') && (
                <div className="mb-6 pb-6 border-b">
                  <p className="text-sm text-gray-600 mb-1">Earnest Money Deposit (EMD)</p>
                  <p className="text-xl font-bold text-gray-800">
                    ₹{property.EMD.toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              {/* Auction Date */}
              {isFieldVisible('AuctionDate') && (
                <div className="mb-6">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar size={18} className="mr-2" />
                    <span className="text-sm font-medium">Auction Date</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {auctionDate}
                  </p>
                  {isFieldVisible('auctionStartDate') && property.auctionStartDate && (
                    <p className="text-sm text-gray-600 mt-1">
                      Start: {property.auctionStartDate}
                    </p>
                  )}
                  {isFieldVisible('auctionEndTime') && property.auctionEndTime && (
                    <p className="text-sm text-gray-600">
                      End: {property.auctionEndTime}
                    </p>
                  )}
                </div>
              )}

              {/* Application Deadline */}
              {isFieldVisible('applicationSubmissionDate') && property.applicationSubmissionDate && (
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

              {/* Inspection Date */}
              {isFieldVisible('inspectionDate') && (
                <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center text-blue-700 mb-2">
                    <Calendar size={18} className="mr-2" />
                    <span className="text-sm font-semibold">Inspection Date</span>
                  </div>
                  {property.inspectionDate && 
                   property.inspectionDate.toLowerCase() !== "not available" && 
                   property.inspectionDate.trim() !== "" ? (
                    <p className="text-sm text-blue-900 font-medium">
                      {property.inspectionDate}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-blue-900">Not Available - Call for details</p>
                      {isFieldVisible('agentMobile') && (
                        <a 
                          href={`tel:${(property.agentMobile || defaultPhone).replace(/\s/g, "")}`} 
                          className="inline-flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                        >
                          📞 {property.agentMobile || defaultPhone}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="space-y-3 mb-6">
                <a href={`tel:${(property.agentMobile || defaultPhone).replace(/\s/g, "")}`} className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition text-center">
                  {property.agentMobile || defaultPhone}
                </a>
                <a href={`https://api.whatsapp.com/send/?phone=${(property.agentMobile || defaultPhone).replace(/\s/g, "").replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="block w-full border-2 border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition text-center">
                  WhatsApp Us
                </a>
              </div>

              {/* Additional Details */}
              <div className="border-t pt-4 space-y-4 text-sm">
                {isFieldVisible('assetCategory') && property.assetCategory && (
                  <div>
                    <span className="text-gray-600">Asset Category:</span>
                    <p className="font-medium text-gray-800">{property.assetCategory}</p>
                  </div>
                )}
                {isFieldVisible('publicationDate') && property.publicationDate && (
                  <div>
                    <span className="text-gray-600">Publication Date:</span>
                    <p className="font-medium text-gray-800">{property.publicationDate}</p>
                  </div>
                )}
                {isFieldVisible('bankName') && property.bankName && (
                  <div>
                    <span className="text-gray-600">Bank Name:</span>
                    <p className="font-medium text-gray-800">{property.bankName}</p>
                  </div>
                )}
                {isFieldVisible('branchName') && property.branchName && (
                  <div>
                    <span className="text-gray-600">Branch:</span>
                    <p className="font-medium text-gray-800">{property.branchName}</p>
                  </div>
                )}
                {isFieldVisible('borrowerName') && property.borrowerName && (
                  <div>
                    <span className="text-gray-600">Borrower:</span>
                    <p className="font-medium text-gray-800">{property.borrowerName}</p>
                  </div>
                )}
                {isFieldVisible('category') && property.category && (
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <p className="font-medium text-gray-800">{property.category}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Communities Section */}
            {communities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 mt-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">Join Local Communities</h2>
                <div className="space-y-3">
                  {communities.map((community) => (
                    <a
                      key={community.id}
                      href={community.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition group"
                    >
                      <div className="flex items-start gap-3">
                        {community.image && (
                          <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={community.image}
                              alt={community.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition truncate">
                            {community.name}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {community.memberCount}+ members
                          </p>
                          {community.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {community.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                <Link
                  href="/communities"
                  className="block mt-4 text-center text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  View All Communities →
                </Link>
              </motion.div>
            )}

            {/* Property Banners */}
            <PropertyBanners />

            {/* Related Properties Section - Shows after banners on mobile only */}
            {relatedProperties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 lg:hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Similar Properties</h2>
                  <Link
                    href={`/properties?state=${property.state}&type=${property.type}`}
                    className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 transition"
                  >
                    View More →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedProperties.map((relatedProp) => {
                    const locationParts = [relatedProp.location, relatedProp.state].filter(Boolean);
                    return (
                      <PropertyCard
                        key={relatedProp.id}
                        id={relatedProp.id}
                        title={relatedProp.name}
                        location={locationParts.length > 0 ? locationParts.join(', ') : 'Location not specified'}
                        price={formatIndianPrice(relatedProp.reservePrice)}
                        image={relatedProp.images[0] || "/image.png"}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
