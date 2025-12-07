import { generateMetadata as generateSEOMetadata, generateFAQSchema } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Join as Member - Partner with Us",
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

const agentFAQs = [
  {
    question: "What are the requirements to join as an agent?",
    answer: "You need at least 0-1 years of experience in real estate. A valid real estate license is preferred but not mandatory. We welcome both experienced professionals and newcomers to the industry.",
  },
  {
    question: "What benefits do agents receive?",
    answer: "Agents get access to a wide network of buyers and sellers across India, competitive commission structure, ongoing training programs, dedicated support team, and marketing resources.",
  },
  {
    question: "How long does the approval process take?",
    answer: "We typically review applications within 48 hours. Once approved, you'll receive onboarding instructions and can start listing properties immediately.",
  },
  {
    question: "Is there any fee to join?",
    answer: "No, joining Raahi Auction as an agent is completely free. We don't charge any registration or membership fees.",
  },
];

export const agentFAQSchema = generateFAQSchema(agentFAQs);
