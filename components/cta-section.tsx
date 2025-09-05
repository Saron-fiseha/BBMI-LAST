"use client"

import Link from "next/link"
import { Meteors } from "@/components/magicui/meteors"
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"

export function CTASection() {
  return (
    // Using your #D1A392 color for the background
    <section className="relative py-20 bg-[#D1A392] text-white overflow-hidden">
      <Meteors number={20} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <AnimatedGradientText
            text="Ready to Start Your Beauty Career?"
            // Text color is white for contrast as per the image
            className="text-4xl md:text-6xl font-bold mb-6 text-black"
          />

          <AnimatedShinyText
            text="Join BBMI today and transform your passion for beauty into a successful, rewarding career. Our expert instructors and comprehensive programs will guide you every step of the way."
            // Text color is a slightly off-white for a softer look
            className="text-xl md:text-2xl mb-8 text-black leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* 
              UPDATED: Enroll Now button styled to match Contact Us button size
              while keeping its gradient color scheme.
            */}
            <Link
                href="/register"
                 className="h-11 inline-flex items-center justify-center text-lg bg-gradient-to-r from-custom-copper to-custom-tan text-white font-bold px-10 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105"
          >
              Enroll Now
            </Link>

            {/* 
              UPDATED: Contact Us button with no default border and specific hover state.
              Removed variant="outline".
            */}
            <InteractiveHoverButton
              href="/contact"
              size="lg"
              className="text-lg px-10 py-4 bg-white text-black font-bold rounded-lg shadow-lg hover:bg-black hover:text-white"
            >
              Contact Us
            </InteractiveHoverButton>
          </div>
        </div>
      </div>
    </section>
  )
}