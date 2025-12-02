import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "My Profile - Manage Your Account",
  description: "Manage your Raahi Auction profile. Update your information, view saved properties, and track your real estate journey.",
  keywords: [
    "user profile",
    "account settings",
    "my properties",
  ],
  url: "/profile",
});
