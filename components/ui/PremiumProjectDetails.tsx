import Image from "next/image";
import { useEffect, useState } from "react";
import { MapPin, Download, Heart } from "lucide-react";
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
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mt-8 relative">
        {/* Premium badge */}
        <span className="absolute -top-6 left-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">PREMIUM</span>
        {/* Carousel */}
        <PremiumProjectImageCarousel images={images} />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <ShareButton
                propertyId={project.id}
                propertyName={project.name}
                location={project.location}
                price={project.price}
                image={mainImage}
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
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">{project.location}</span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-700 mb-4 text-base">{project.description}</p>
              <div className="text-green-600 font-bold text-2xl mb-2">{project.price}</div>
              {project.brochure && (
                <a href={project.brochure} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">
                  <Download className="h-4 w-4 mr-1" /> Brochure
                </a>
              )}
            </div>
            {project.agentNumber && (
              <a
                href={`tel:${project.agentNumber}`}
                className="w-full block bg-green-600 text-white text-lg font-semibold py-3 rounded-xl hover:bg-green-700 transition mb-2 shadow-lg text-center"
              >
                Enquire Now
              </a>
            )}
            {project.agentNumber && (
              <div className="mt-2 text-sm text-gray-500">Agent Contact: <span className="font-semibold text-gray-800">{project.agentNumber}</span></div>
            )}
          </div>
          <div className="md:w-1/2 flex flex-col justify-between">
            <div className="mt-6">
              <span className="text-xs text-gray-400">Project ID: {project.id}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto mt-12">
        <hr className="my-8 border-gray-200" />
        <PremiumProjectSuggestions suggestions={suggestions} />
      </div>
      {/* Sticky WhatsApp button */}
      <a href={`https://wa.me/?text=I'm%20interested%20in%20the%20premium%20project%20${encodeURIComponent(project.name)}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 9.75V8.25A4.5 4.5 0 0 0 12 3.75v0A4.5 4.5 0 0 0 7.5 8.25v1.5m9 0a4.5 4.5 0 0 1-4.5 4.5v0a4.5 4.5 0 0 1-4.5-4.5m9 0v2.25a6.75 6.75 0 0 1-6.75 6.75v0A6.75 6.75 0 0 1 5.25 12V9.75" /></svg>
        WhatsApp
      </a>
    </>
  );
}
