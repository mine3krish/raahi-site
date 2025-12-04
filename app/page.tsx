import JoinCommunity from "@/components/ui/JoinCommunity";
import Hero from "@/components/ui/Hero";
import WhyChooseUs from "@/components/ui/WhyChooseUs";
import PropertyScroller from "@/components/ui/PropertyScroller";
import BestDealsScroller from "@/components/ui/BestDealsScroller";
import PremiumPropertiesScroller from "@/components/ui/PremiumPropertiesScroller";
import IndiaMapSection from "@/components/ui/IndiaMapSection";
import StateWiseProperties from "@/components/ui/StateWiseProperties";
import PartnersScroller from "@/components/ui/PartnersScroller";
import TestimonialsCarousel from "@/components/ui/TestimonialsCarousel";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Home - India's Leading Real Estate Auction Platform",
  description: "Discover the best real estate properties across India. Browse residential, commercial properties, connect with trusted agents, and join property communities. Your dream property awaits!",
  keywords: [
    "real estate india",
    "property auction",
    "buy property",
    "sell property",
    "property marketplace",
    "residential properties",
    "commercial properties",
    "property investment",
  ],
  url: "/",
});

export default function Home() {
  return (
    <div>
      <Hero/>
      <PropertyScroller />
      <WhyChooseUs />
      <BestDealsScroller />
      <PremiumPropertiesScroller />
      <PartnersScroller />
      <TestimonialsCarousel />
      <JoinCommunity />
      <IndiaMapSection />
      <StateWiseProperties />
      {/* Office Location Map */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Visit Our Office
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Raahi Auction Services India Pvt Ltd - Find us on the map
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="relative w-full h-0 pb-[56.25%] rounded-lg overflow-hidden shadow-lg">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.6060720200844!2d72.5856153768066!3d23.038231779162942!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e85517a2facfb%3A0xe9c797ad53bb1dd7!2sRaahi%20Auction%20Services%20India%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1764880979757!5m2!1sen!2sin" 
                className="absolute top-0 left-0 w-full h-full border-0"
                allowFullScreen={true}
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Raahi Auction Services Office Location"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
