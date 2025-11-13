import JoinCommunity from "@/components/ui/JoinCommunity";
import Hero from "@/components/ui/Hero";
import WhyChooseUs from "@/components/ui/WhyChooseUs";
import PropertyScroller from "@/components/ui/PropertyScroller";
import IndiaMapSection from "@/components/ui/IndiaMapSection";
import StateWiseProperties from "@/components/ui/StateWiseProperties";
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
      <WhyChooseUs />
      <JoinCommunity />
      <PropertyScroller />
      <IndiaMapSection />
      <StateWiseProperties />
    </div>
  );
}
