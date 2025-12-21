"use client";

import { useEffect } from "react";
import PremiumProjectCard from "./PremiumProjectCard";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface PremiumProject {
  id: string;
  name: string;
  location: string;
  description: string;
  price: string;
  images: string[];
  brochure?: string;
}
  interface Variant {
    type: string;
    propertyType: string;
    area: string;
    areaSqm?: string;
    price: string;
    priceNote?: string;
  }

  interface PremiumProject {
    id: string;
    name: string;
    location: string;
    description: string;
    price: string;
    images: string[];
    brochure?: string;
    variants?: Variant[];
    whyBuy?: string[];
  }

interface PremiumProjectGridProps {
  projects: PremiumProject[];
  total?: number;
}

export default function PremiumProjectGrid({ projects, total }: PremiumProjectGridProps) {
  // Initialize AdSense ads
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [projects]);

  return (
    <section className="bg-white border-gray-200 py-12">
      <div className="mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-sm text-gray-500">
            Showing {projects.length} {total ? `of ${total}` : ''} results
          </p>
        </div>

        {/* Grid */}
        {projects.length > 0 ? (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              xl:grid-cols-5
              gap-1
              place-items-stretch
            "
          >
            {projects.map((project, index) => (
              <>
                <div key={project.id} className="p-0">
                  <PremiumProjectCard
                    id={project.id}
                    name={project.name}
                    location={project.location}
                    description={project.description}
                    price={project.price}
                    images={project.images}
                    brochure={project.brochure}
                    variants={project.variants}
                    />
                </div>
                {/* Insert ad after every 10 projects */}
                {(index + 1) % 10 === 0 && index !== projects.length - 1 && (
                  <div key={`ad-${index}`} className="col-span-1 sm:col-span-2 lg:col-span-4 xl:col-span-5 p-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ins className="adsbygoogle"
                           style={{ display: 'block', width: '100%', minHeight: '250px' }}
                           data-ad-format="fluid"
                           data-ad-layout-key="-6t+ed+2i-1n-4w"
                           data-ad-client="ca-pub-7792213399438771"
                           data-ad-slot="1429909386"></ins>
                    </div>
                  </div>
                )}
              </>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-gray-300 rounded-lg">
            <p className="text-lg font-medium mb-2">No premium projects found</p>
            <p className="text-sm text-gray-400">
              Check back later for new projects.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}