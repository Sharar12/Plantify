import React from 'react';
import Image from 'next/image';

export interface OptimizedPlantImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function OptimizedPlantImage({ src, alt, className = '' }: OptimizedPlantImageProps) {
  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading="lazy"
        className="object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
  );
}
