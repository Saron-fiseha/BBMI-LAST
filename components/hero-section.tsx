"use client"
import Link from "next/link"
import { SparklesText } from "@/components/magicui/sparkles-text"
import { ShinyButton } from "@/components/magicui/shiny-button"
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import Image from "next/image"
import { Sparkles, ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-[95vh] flex items-center justify-center bg-gradient-to-br from-[#FCF9F3] via-[#FAF3E7] to-[#F3EAD9] overflow-hidden py-16 lg:py-24">
      {/* Decorative Background Glowing Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#EAD0B7] to-transparent opacity-30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-[#F1CFC1] to-transparent opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-[#EBD9CE]/25 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text and Action Area */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Elite Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-[#CA9C73]/25 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#C19570] animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-[#71423E] uppercase">
                Brushed By Betty Makeup Institute
              </span>
            </div>

            {/* Premium Heading */}
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
                Transform Your <br />
                <span className="bg-gradient-to-r from-[#71423E] via-[#C19570] to-[#CA9C73] bg-clip-text text-transparent">
                  Passion Into Profession
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
                Join BBMI's comprehensive beauty training programs. Master the art of makeup, nail care, and lash extensions with industry experts.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <ShinyButton href="/courses" className="text-lg px-8 py-4 bg-gradient-to-r from-[#71423E] to-[#5C4033] hover:shadow-lg transition-shadow">
                Explore Courses
              </ShinyButton>
              <InteractiveHoverButton
                href="/register"
                variant="outline"
                className="text-lg px-8 py-4 border border-[#CA9C73]/40 text-gray-800 hover:bg-[#D1A392]/20 backdrop-blur-sm"
              >
                Join Now
              </InteractiveHoverButton>
            </div>

            {/* Glassmorphic Stats Section */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 p-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/60 shadow-md max-w-xl">
              <div className="text-center relative">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#71423E]">4500+</div>
                <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Students</div>
                <div className="absolute right-0 top-1/4 h-1/2 w-[1px] bg-[#CA9C73]/30 hidden sm:block" />
              </div>
              <div className="text-center relative">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#C19570]">15+</div>
                <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Instructors</div>
                <div className="absolute right-0 top-1/4 h-1/2 w-[1px] bg-[#CA9C73]/30 hidden sm:block" />
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-800">98%</div>
                <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Editorial Collage Area */}
          <div className="lg:col-span-5 relative flex justify-center items-center h-[450px] sm:h-[550px] w-full mt-8 lg:mt-0">
            {/* Background Decorative Gold Frame */}
            <div className="absolute inset-4 border border-[#CA9C73]/15 rounded-3xl transform rotate-2 pointer-events-none -z-10" />
            
            {/* Background Image Card */}
            <div className="absolute top-4 left-4 w-[75%] h-[75%] rounded-3xl overflow-hidden shadow-xl border border-white/40 transform -rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]">
              <Image
                src="/home2.jpg"
                alt="Brushed by Betty Academy campus"
                layout="fill"
                objectFit="cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#5C4033]/20 via-transparent to-transparent" />
            </div>

            {/* Foreground Image Card */}
            <div className="absolute bottom-4 right-4 w-[75%] h-[75%] rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-3 transition-all duration-500 hover:rotate-0 hover:scale-[1.03]">
              <Image
                src="/home-new.jpg"
                alt="A student applying makeup professionally"
                layout="fill"
                objectFit="cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#5C4033]/30 via-transparent to-transparent" />
            </div>

            {/* Floating Accent Tag */}
            <div className="absolute top-[40%] right-[-10px] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 transform -rotate-6 animate-bounce duration-1000 hidden sm:flex">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C19570]" />
              <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">Fully Accredited</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}