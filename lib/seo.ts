// SEO Configuration and Utilities
export const SITE_CONFIG = {
  name: "Raahi Auction",
  description: "India's leading real estate auction platform. Discover properties, join communities, and connect with trusted agents across all states and union territories.",
  url: "https://raahiauction.com",
  ogImage: "/image.png",
  links: {
    twitter: "https://twitter.com/raahiauction",
    facebook: "https://facebook.com/raahiauction",
    instagram: "https://instagram.com/raahiauction",
  },
};

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function generateMetadata({
  title,
  description,
  image = SITE_CONFIG.ogImage,
  url = SITE_CONFIG.url,
  type = "website",
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_CONFIG.name}`;
  const fullUrl = url.startsWith("http") ? url : `${SITE_CONFIG.url}${url}`;
  const fullImage = image.startsWith("http") ? image : `${SITE_CONFIG.url}${image}`;

  const defaultKeywords = [
    "real estate",
    "property auction",
    "india properties",
    "buy property",
    "sell property",
    "real estate agents",
    "property communities",
  ];

  const allKeywords = [...defaultKeywords, ...keywords].join(", ");

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: author ? [{ name: author }] : [{ name: SITE_CONFIG.name }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    openGraph: {
      type,
      locale: "en_IN",
      url: fullUrl,
      title: fullTitle,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [fullImage],
      creator: "@raahiauction",
      site: "@raahiauction",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

// Structured Data Generators
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/image.png`,
    description: SITE_CONFIG.description,
    sameAs: [
      SITE_CONFIG.links.twitter,
      SITE_CONFIG.links.facebook,
      SITE_CONFIG.links.instagram,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-98765-43210",
      contactType: "Customer Service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/properties?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generatePropertySchema(property: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.title,
    description: property.description,
    image: property.images?.map((img: string) => 
      img.startsWith("http") ? img : `${SITE_CONFIG.url}${img}`
    ) || [],
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
      availability: property.status === "Active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
      },
    },
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    category: property.type,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Location",
        value: `${property.location}, ${property.state}`,
      },
      {
        "@type": "PropertyValue",
        name: "Area",
        value: property.area,
      },
    ],
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
