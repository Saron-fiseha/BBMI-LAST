"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { useRef } from "react"

interface Certificate {
  id: number
  imageSrc: string
  alt: string
}

interface CertificationsCarouselProps {
  certificates: Certificate[]
}

export default function CertificationsCarousel({ certificates }: CertificationsCarouselProps) {
  // Autoplay plugin (adjust delay as needed: 3000ms = 3 seconds)
  const autoplay = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  )

  return (
    <Carousel
      opts={{ loop: true }}
      plugins={[autoplay.current]}
      className="relative"
    >
      <CarouselContent>
        {certificates.map((cert) => (
          <CarouselItem key={cert.id}>
            <div className="p-1">
              <div className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={cert.imageSrc}
                  alt={cert.alt}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Navigation buttons */}
      <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 hidden lg:inline-flex" />
      <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 hidden lg:inline-flex" />
    </Carousel>
  )
}
