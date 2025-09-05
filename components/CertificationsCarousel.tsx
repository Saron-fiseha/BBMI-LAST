"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"

// Interface definitions remain the same
interface Certificate {
  id: number;
  imageSrc: string;
  alt: string;
}

interface CertificationsCarouselProps {
  certificates: Certificate[];
}

export default function CertificationsCarousel({ certificates }: CertificationsCarouselProps) {
  return (
    <Carousel opts={{ loop: true }} className="relative">
      <CarouselContent>
        {certificates.map((cert) => (
          <CarouselItem key={cert.id}>
            <div className="p-1">
              {/* --- THE FIX --- */}
              {/* 
                1. Replaced `aspect-video` with a fixed height (`h-[500px] md:h-[600px]`) 
                   to give the vertical image more space.
                2. Removed `bg-black` to make the background transparent.
              */}
              <div className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={cert.imageSrc}
                  alt={cert.alt}
                  fill
                  // `object-contain` is still essential to prevent the image from being distorted.
                  className="object-contain"
                />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden lg:inline-flex" />
      <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden lg:inline-flex" />
    </Carousel>
  );
}