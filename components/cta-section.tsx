"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Meteors } from "@/components/magicui/meteors"
import { ShinyButton } from "@/components/magicui/shiny-button"
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"

export function CTASection() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-800 via-slate-600 to-slate-900 text-white overflow-hidden">
      <Meteors number={30} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <AnimatedGradientText
            text="Ready to Start Your Beauty Career?"
            className="text-4xl md:text-6xl font-bold mb-6 text-white"
          />

          <AnimatedShinyText
            text="Join BBMI today and transform your passion for beauty into a successful, rewarding career. Our expert instructors and comprehensive programs will guide you every step of the way."
            className="text-xl md:text-2xl mb-8 text-pink-100 leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <ShinyButton
              href="/register"
              size="lg"
              className="text-lg px-10 py-4 bg-white text-black-900 hover:bg-pink-100"
            >
              Enroll Now
            </ShinyButton>

            <InteractiveHoverButton
              href="/contact"
              variant="outline"
              size="lg"
              className="text-lg px-10 py-4 border-2 border-white text-black hover:bg-white hover:text-purple-900"
            >
              Contact Us
            </InteractiveHoverButton>
          </div>

          {/* <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-pink-300 mb-2">Flexible</div>
              <AnimatedShinyText text="Evening and weekend classes available" className="text-pink-100" />
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-300 mb-2">Certified</div>
              <AnimatedShinyText text="Industry-recognized certifications" className="text-pink-100" />
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-300 mb-2">Support</div>
              <AnimatedShinyText text="Career placement assistance included" className="text-pink-100" />
            </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}

