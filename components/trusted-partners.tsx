"use client"

import { ScrollBasedVelocity } from "@/components/magicui/scroll-based-velocity"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"

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
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our graduates work with the world's most prestigious beauty brands
            </p>
        </div>
      </div>

      <ScrollBasedVelocity className="py-8">
        <div className="flex items-center space-x-16">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 text-2xl font-semibold text-gray-700 whitespace-nowrap"
            >
              <span className="text-4xl">{partner.logo}</span>
              <span>{partner.name}</span>
            </div>
          ))}
        </div>
      </ScrollBasedVelocity>

      <ScrollBasedVelocity baseVelocity={-100} className="py-8">
        <div className="flex items-center space-x-16">
          {partners.reverse().map((partner, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 text-2xl font-semibold text-gray-700 whitespace-nowrap"
            >
              <span className="text-4xl">{partner.logo}</span>
              <span>{partner.name}</span>
            </div>
          ))}
        </div>
      </ScrollBasedVelocity>
    </section>
  )
}
