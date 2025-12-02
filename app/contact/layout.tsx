import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Contact Us - Get in Touch with Our Team",
  description: "Get in touch with Raahi Auction. Have questions about properties or our services? We're here to help! Contact us via phone, email, or submit your inquiry online.",
  keywords: [
    "contact raahi auction",
    "real estate support",
    "property inquiry",
    "customer service",
    "get in touch",
  ],
  url: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
