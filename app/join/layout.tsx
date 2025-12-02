import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Join as Agent - Partner with India's Leading Platform",
  description: "Become a real estate agent with Raahi Auction. Join India's fastest-growing property platform. Get access to wide network, higher earnings, and dedicated support. Apply now!",
  keywords: [
    "real estate agent",
    "property agent",
    "agent partnership",
    "real estate career",
    "agent jobs india",
    "property consultant",
    "real estate professional",
  ],
  url: "/join",
});

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
