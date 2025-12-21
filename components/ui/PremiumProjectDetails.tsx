import Image from "next/image";
import { useEffect, useState } from "react";
import { MapPin, Download, Heart, Phone, MessageCircle } from "lucide-react";
import ShareButton from "./ShareButton";
import { useWishlist } from "@/context/WishlistContext";
import PremiumProjectBanner from "./PremiumProjectBanner";
import PremiumProjectSuggestions from "./PremiumProjectSuggestions";
import PremiumProjectImageCarousel from "./PremiumProjectImageCarousel";

export default function PremiumProjectDetails({ project }: { project: any }) {
  const images = project.images?.length ? project.images : ["/image.png"];
  const mainImage = images[0];
  const { isInWishlist, toggleWishlist, loading } = useWishlist();
  const inWishlist = isInWishlist(project.id);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(project.id);
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length == 11) ? match[2] : null;
  };

  useEffect(() => {
    // Fetch suggestions (other premium projects, excluding current)
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/premium-projects?limit=3&exclude=${project.id}`);
        const data = await res.json();
        setSuggestions((data.projects || []).filter((p: any) => p.id !== project.id));
      } catch {}
    };
    if (project?.id) fetchSuggestions();
  }, [project?.id]);

  return (
    <>
      <PremiumProjectBanner image={mainImage} title={project.name} subtitle={project.location} />
      
      {/* Main Content Container with Subtle Background */}
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          {/* Premium Badge with Elegant Design */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 blur-lg opacity-30"></div>
              <span className="relative bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-white text-xs font-bold tracking-[0.2em] px-6 py-2.5 rounded-lg">
                PREMIUM
              </span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-400 tracking-wider">ID: {project.id}</span>
          </div>

          {/* Image Carousel */}
          <div className="mb-12 md:mb-16 rounded-2xl overflow-hidden">
            <PremiumProjectImageCarousel images={images} />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Hero Section with Gradient Background */}
              <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 rounded-xl md:rounded-2xl border border-gray-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl"></div>
                <div className="relative p-6 md:p-10">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6 md:mb-8">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-xs md:text-sm font-semibold text-blue-600 tracking-wide uppercase">{project.location}</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-5 leading-tight">{project.name}</h1>
                      <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed">{project.description}</p>
                    </div>
                    
                    {/* Action Buttons with Refined Style */}
                    <div className="flex gap-2 md:gap-3 md:ml-6">
                      <div className="transform hover:scale-105 transition-transform">
                        <ShareButton
                          propertyId={project.id}
                          propertyName={project.name}
                          location={project.location}
                          price={project.price}
                          image={mainImage}
                          compact
                        />
                      </div>
                      <button
                        onClick={handleWishlistClick}
                        disabled={loading}
                        className={`p-2.5 md:p-3.5 rounded-xl transition-all transform hover:scale-105 ${
                          inWishlist 
                            ? "bg-gradient-to-br from-red-500 to-red-600 text-white" 
                            : "bg-white text-gray-400 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:text-white"}
                        ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart 
                          size={20} 
                          fill={inWishlist ? "currentColor" : "none"}
                          strokeWidth={2}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Price Section with Premium Styling */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-4 pt-6 md:pt-8 border-t border-gray-200/50">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {project.price}
                      </span>
                    </div>
                    {project.brochure && (
                      <a 
                        href={project.brochure} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="sm:ml-auto flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm transition-all transform hover:scale-105"
                      >
                        <Download className="h-4 w-4" />
                        Download Brochure
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Variants Section with Cards */}
              {project.variants && project.variants.length > 0 && (
                <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 md:px-10 py-4 md:py-6 border-b border-gray-100">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Available Options</h2>
                  </div>
                  <div className="p-6 md:p-8 space-y-3 md:space-y-4">
                    {project.variants.map((v: any, idx: number) => (
                      <div key={idx} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-blue-50/20 p-4 md:p-6 border border-gray-100 hover:border-blue-200 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 w-full">
                            <div className="font-bold text-base md:text-lg lg:text-xl text-gray-900 mb-2">{v.type}</div>
                            <div className="text-xs md:text-sm text-gray-600 flex flex-wrap items-center gap-2 md:gap-3">
                              <span className="px-2 md:px-3 py-1 bg-white rounded-lg text-xs font-medium">{v.propertyType}</span>
                              <span className="font-medium">{v.area}{v.areaSqm ? ` (${v.areaSqm})` : ''}</span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{v.price}</div>
                            {v.priceNote && <div className="text-xs text-gray-500 mt-1">{v.priceNote}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Why Buy Section with Elegant Design */}
              {project.whyBuy && project.whyBuy.length > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50/50 to-white rounded-xl md:rounded-2xl border border-green-100">
                  <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl"></div>
                  <div className="relative px-6 md:px-10 py-6 md:py-8">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-green-900 mb-4 md:mb-6 flex items-center gap-2">
                      <span className="w-1.5 md:w-2 h-6 md:h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></span>
                      Why Invest in This Project
                    </h2>
                    <div className="space-y-3 md:space-y-4">
                      {project.whyBuy.map((reason: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 md:gap-4 group">
                          <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                          <p className="text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Features Section with Grid */}
              {project.features && project.features.length > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white rounded-xl md:rounded-2xl border border-blue-100">
                  <div className="absolute bottom-0 right-0 w-56 h-56 bg-gradient-to-tl from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
                  <div className="relative px-6 md:px-10 py-6 md:py-8">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-blue-900 mb-4 md:mb-6 flex items-center gap-2">
                      <span className="w-1.5 md:w-2 h-6 md:h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
                      Features & Amenities
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                      {project.features.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 md:gap-4 group">
                          <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                          <p className="text-sm md:text-base text-gray-700 leading-relaxed">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Video Section */}
              {project.ytVideoLink && (
                <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-red-50/30 px-6 md:px-10 py-4 md:py-6 border-b border-gray-100">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Project Walkthrough</h2>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(project.ytVideoLink)}`}
                        title="Project Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Contact Sidebar with Premium Styling */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/20 to-white rounded-xl md:rounded-2xl border border-gray-200">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl"></div>
                  <div className="relative p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Get in Touch</h3>
                    
                    {project.agentNumber && (
                      <>
                        <a
                          href={`tel:${project.agentNumber}`}
                          className="w-full flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 md:py-5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 mb-4"
                        >
                          <Phone className="w-4 h-4 md:w-5 md:h-5" />
                          <span className="text-sm md:text-base">Call Now</span>
                        </a>
                        
                        <div className="text-center mb-4 md:mb-6 p-4 md:p-5 bg-gradient-to-br from-gray-50 to-green-50/20 rounded-xl border border-gray-100">
                          <div className="text-xs md:text-sm text-gray-500 mb-2 font-medium">Direct Contact</div>
                          <div className="text-lg md:text-xl font-bold text-gray-900">{project.agentNumber}</div>
                        </div>
                      </>
                    )}

                    <div className="pt-4 md:pt-6 border-t border-gray-200">
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed text-center">
                        Schedule a site visit or request more information about this premium project.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions Section */}
          <div className="mt-12 md:mt-20 pt-12 md:pt-16 border-t border-gray-200">
            <PremiumProjectSuggestions suggestions={suggestions} />
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button with Premium Design */}
      <a 
        href={`https://wa.me/?text=I'm%20interested%20in%20the%20premium%20project%20${encodeURIComponent(project.name)}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl md:rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 transition-all transform group-hover:scale-105">
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
          <span className="font-bold text-sm md:text-base lg:text-lg">WhatsApp</span>
        </div>
      </a>
    </>
  );
}