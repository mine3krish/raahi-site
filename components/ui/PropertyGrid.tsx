"use client";

import { useEffect } from "react";
import PropertyCard from "./PropertyCard";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
}

interface PropertyGridProps {
  properties: Property[];
  total?: number;
}

export default function PropertyGrid({ properties, total }: PropertyGridProps) {
  // Initialize AdSense ads
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [properties]);
  return (
    <section className="bg-white border-gray-200 py-12">
      <div className="mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-sm text-gray-500">
            Showing {properties.length} {total ? `of ${total}` : ''} results
          </p>
        </div>

        {/* Grid */}
        {properties.length > 0 ? (
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
            {properties.map((property, index) => (
              <>
                <div key={property.id} className="p-0">
                  <PropertyCard
                    id={property.id}
                    title={property.title}
                    location={property.location}
                    price={property.price}
                    image={property.image}
                  />
                </div>
                {/* Insert ad after every 10 properties */}
                {(index + 1) % 10 === 0 && index !== properties.length - 1 && (
                  <div key={`ad-${index}`} className="col-span-1 sm:col-span-2 lg:col-span-4 xl:col-span-5 p-4">
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[250px]">
                      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7792213399438771"
                           crossOrigin="anonymous"></script>
                      <ins className="adsbygoogle"
                           style={{ display: 'block' }}
                           data-ad-format="fluid"
                           data-ad-layout-key="-6t+ed+2i-1n-4w"
                           data-ad-client="ca-pub-7792213399438771"
                           data-ad-slot="1429909386"></ins>
                      <script dangerouslySetInnerHTML={{
                        __html: `(adsbygoogle = window.adsbygoogle || []).push({});`
                      }} />
                    </div>
                  </div>
                )}
              </>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-gray-300 rounded-lg">
            <p className="text-lg font-medium mb-2">No properties found</p>
            <p className="text-sm text-gray-400">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
