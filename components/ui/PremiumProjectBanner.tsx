import Image from "next/image";

export default function PremiumProjectBanner({ image, title, subtitle }: { image: string, title: string, subtitle?: string }) {
  return (
    <div className="w-full h-56 md:h-72 relative rounded-xl overflow-hidden mb-8">
      <Image src={image} alt={title} fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex flex-col justify-end p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">{title}</h1>
        {subtitle && <p className="text-lg text-white/80 drop-shadow-lg">{subtitle}</p>}
      </div>
    </div>
  );
}
