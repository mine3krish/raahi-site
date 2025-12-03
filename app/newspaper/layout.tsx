import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Auction Newspaper - Raahi Auction",
  description: "Generate daily newspaper PDF with all properties listed. Download or view property listings in newspaper format.",
};

export default function NewspaperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
