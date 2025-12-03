"use client";

import React from "react";

interface StructuredDataProps {
  data: any;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BreadcrumbProps {
  items: { name: string; url: string }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={item.url} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            {index === items.length - 1 ? (
              <span className="font-medium text-gray-900">{item.name}</span>
            ) : (
              <a
                href={item.url}
                className="hover:text-green-600 transition"
              >
                {item.name}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
