import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Property Communities",
  description: "Join WhatsApp communities of property enthusiasts across India. Connect with buyers, sellers, and real estate professionals in your state. Stay updated with latest property deals.",
  keywords: [
    "property communities",
    "real estate communities",
    "whatsapp groups",
    "property buyers group",
    "real estate networking",
    "property deals",
  ],
  url: "/communities",
});
