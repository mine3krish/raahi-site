import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Sign Up",
  description: "Create your free Raahi Auction account. Get access to exclusive property listings, save favorites, and connect with real estate professionals across India.",
  keywords: [
    "sign up",
    "register",
    "create account",
    "join raahi auction",
  ],
  url: "/signup",
});
