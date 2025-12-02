import { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/seo';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: propertyId } = await params;
  
  try {
    // Fetch property data for metadata
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/properties/${propertyId}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return {
        title: 'Property Not Found',
        description: 'The requested property could not be found.',
      };
    }
    
    const data = await response.json();
    const property = data.property;
    
    const title = `${property.name} - ${property.location}, ${property.state}`;
    const { formatIndianPrice } = await import('@/lib/constants');
    const description = `${property.name} in ${property.location}, ${property.state}. ${property.type} property for auction. Reserve Price: ${formatIndianPrice(property.reservePrice)}. EMD: ${formatIndianPrice(property.EMD)}. Auction Date: ${property.AuctionDate}. ${property.area ? `Area: ${property.area} sq ft.` : ''} Status: ${property.status}.`;
    
    const image = property.images && property.images.length > 0 
      ? property.images[0] 
      : `${SITE_CONFIG.url}/image.png`;
    
    const fullUrl = `${SITE_CONFIG.url}/properties/${propertyId}`;
    
    return {
      title,
      description,
      keywords: [
        property.name,
        property.state,
        property.location,
        property.type,
        'property auction',
        'real estate',
        `${property.state} properties`,
        `buy property in ${property.state}`,
        'EMD property',
        'auction property',
      ].join(', '),
      openGraph: {
        type: 'article',
        locale: 'en_IN',
        url: fullUrl,
        title,
        description,
        siteName: SITE_CONFIG.name,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: property.name,
          },
        ],
        publishedTime: property.createdAt,
        modifiedTime: property.updatedAt,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
        creator: '@raahiauction',
        site: '@raahiauction',
      },
      robots: {
        index: property.status === 'Active',
        follow: true,
        googleBot: {
          index: property.status === 'Active',
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: fullUrl,
      },
    };
  } catch (error) {
    console.error('Error generating property metadata:', error);
    return {
      title: 'Property Details',
      description: 'View property details and auction information.',
    };
  }
}

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
