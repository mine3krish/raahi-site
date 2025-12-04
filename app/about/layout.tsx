import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us & Our Team - Raahi Auction",
  description: "Learn about Raahi Auction and meet our dedicated team - India's trusted real estate auction platform",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
