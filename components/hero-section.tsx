"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SparklesText } from "@/components/magicui/sparkles-text"
import { TextAnimate } from "@/components/magicui/text-animate"
import { AuroraText } from "@/components/magicui/aurora-text"
import { ShinyButton } from "@/components/magicui/shiny-button"
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 overflow-hidden">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <SparklesText
                text="Transform Your Passion Into Profession"
                className="text-4xl md:text-6xl font-bold text-gray-900"
              />
              <TextAnimate
                text="Join BBMI's comprehensive beauty training programs and master the art of makeup, skincare, and beauty techniques with industry experts."
                className="text-lg md:text-xl text-gray-600 leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <ShinyButton href="/courses" size="lg" className="text-lg px-8 py-4">
                Explore Courses
              </ShinyButton>
              <InteractiveHoverButton
                href="/register"
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-0 border-golden-500 text-black-600 hover:bg-slate-800 hover:text-white"
              >
                Join Now
              </InteractiveHoverButton>
            </div>

            <div className="flex items-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">4500+</div>
                <div className="text-sm text-gray-600">Students Trained</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-800">15+</div>
                <div className="text-sm text-gray-600">Expert Instructors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">98%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* <AuroraText text="Beauty Mastery Awaits" className="text-2xl md:text-3xl font-bold mb-6 text-center" /> */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://i.pinimg.com/736x/17/ca/e8/17cae895e1f4356f774df5548c404af0.jpg"
                alt="Beauty training at BBMI"
                width={500}
                height={600}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
