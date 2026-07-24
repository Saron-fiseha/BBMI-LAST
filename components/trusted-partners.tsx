

"use client"

import { ScrollBasedVelocity } from "@/components/magicui/scroll-based-velocity"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import Image from "next/image"



 const partners = [
  { name: "Sephora", logo: "🎨" },
  { name: "MAC Cosmetics", logo: "💄" },
  { name: "Urban Decay", logo: "✨" },
  { name: "NARS", logo: "🌟" },
  { name: "Charlotte Tilbury", logo: "👑" },
  { name: "Fenty Beauty", logo: "💎" },
  { name: "Glossier", logo: "🌸" },
  { name: "Rare Beauty", logo: "🦋" },
]

export function TrustedPartners() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center">
          <AnimatedGradientText text="Trusted by Industry Leaders" className="text-3xl md:text-4xl font-bold mb-4" />
          <p className="text-lg text-black-600 max-w-2xl mx-auto">
            Our graduates work with the world's most prestigious beauty brands
          </p>
        </div>
      </div>

      {/* Top border line */}
      <div className="border-t border-black"></div>

      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            {/* Static "Trusted us" text - stays fixed, doesn't move */}
            <div className="text-black text-lg font-medium whitespace-nowrap mr-12 flex-shrink-0">Trusted us</div>

            {/* Scroll velocity section - only logos move */}
            <div className="flex-1 overflow-hidden">
              <ScrollBasedVelocity className="flex items-center">
                <div className="flex items-center space-x-16">
                  {partners.map((partner, index) => (
                    <div key={index} className="flex items-center justify-center whitespace-nowrap">
                      {/* <Image
                        src={partner.logo || "/placeholder.svg"}
                        alt={partner.name}
                        width={120}
                        height={80}
                        className="h-16 w-auto object-contain bg-white rounded-lg shadow-sm p-3"
                      /> */}
                      <span className="h-16 w-auto object-contain bg-white rounded-lg shadow-sm p-3">{partner.logo}</span>
                      <span>{partner.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollBasedVelocity>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom border line */}
      <div className="border-b border-black"></div>
    </section>
  )
}
