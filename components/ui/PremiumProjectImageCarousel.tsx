import Image from "next/image";
import { useState } from "react";

export default function PremiumProjectImageCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div className="relative w-full h-72 rounded-xl overflow-hidden mb-4">
      <Image src={images[current]} alt="Project Image" fill className="object-cover" />
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((img, idx) => (
            <button
              key={img}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full border-2 ${current === idx ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
