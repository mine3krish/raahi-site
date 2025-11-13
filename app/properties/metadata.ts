import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Browse Properties",
  description: "Explore thousands of residential and commercial properties across India. Filter by location, type, and price to find your perfect property. Active listings updated daily.",
  keywords: [
    "browse properties",
    "property listings",
    "real estate search",
    "properties for sale",
    "properties for rent",
    "residential properties india",
    "commercial properties india",
  ],
  url: "/properties",
});
