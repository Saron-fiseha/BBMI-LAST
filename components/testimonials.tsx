"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BlurFade } from "@/components/magicui/blur-fade"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { Star } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Professional Makeup Artist",
    image: "/placeholder.svg?height=80&width=80",
    content:
      "BBMI transformed my passion into a thriving career. The instructors are incredibly knowledgeable and supportive.",
    rating: 5,
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    role: "Skincare Specialist",
    image: "/placeholder.svg?height=80&width=80",
    content:
      "The hands-on training and real-world experience I gained at BBMI gave me the confidence to start my own practice.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Chen",
    role: "Bridal Beauty Expert",
    image: "/placeholder.svg?height=80&width=80",
    content:
      "I love how BBMI combines traditional techniques with modern trends. It's exactly what the industry needs.",
    rating: 5,
  },
  {
    id: 4,
    name: "Jessica Williams",
    role: "Beauty Entrepreneur",
    image: "/placeholder.svg?height=80&width=80",
    content:
      "The business training component helped me launch my own beauty studio. BBMI doesn't just teach skills, they build careers.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-white to-purple-50">
  <div className="container mx-auto px-4">
    <BlurFade className="text-center mb-16">
      <AnimatedGradientText text="What Our Students Say" className="text-4xl md:text-5xl font-bold mb-4" />
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Hear from our successful graduates who are now thriving in the beauty industry
      </p>
    </BlurFade>

    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {testimonials.map((testimonial, index) => (
        <BlurFade key={testimonial.id} delay={index * 0.2}>
          <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-700 text-amber-700" />
                ))}
              </div>

              <blockquote className="text-gray-700 mb-6 text-lg leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              <div className="flex items-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 ring-4 ring-amber-700">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    <AnimatedGradientText text={testimonial.name} />
                  </h4>
                  <p className="text-amber-700 font-medium">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </BlurFade>
      ))}
    </div>
  </div>
</section>
  )
}
