import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Login - Access Your Account",
  description: "Login to your Raahi Auction account. Access your saved properties, manage your profile, and stay updated with the latest real estate opportunities.",
  keywords: [
    "login",
    "sign in",
    "user account",
    "member login",
  ],
  url: "/login",
});
