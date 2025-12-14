import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Fetch property details from your API or DB
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/properties/${params.id}`);
  if (!res.ok) return {};
  const { property } = await res.json();

  if (!property) return {};

  const title = property.name || "Property Details";
  const description = property.description || `View details for property ${property.name || params.id}`;
  const image = property.images?.[0] || "/image.png";
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/properties/${params.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
