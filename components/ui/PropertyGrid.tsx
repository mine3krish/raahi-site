"use client";

import PropertyCard from "./PropertyCard";

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
              lg:grid-cols-3 
              xl:grid-cols-4
              gap-8 
              place-items-stretch
            "
          >
            {properties.map((property) => (
              <div key={property.id} className="p-0">
                <PropertyCard
                  id={property.id}
                  title={property.title}
                  location={property.location}
                  price={property.price}
                  image={property.image}
                />
              </div>
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
