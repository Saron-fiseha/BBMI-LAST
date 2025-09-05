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
    name: "Meklit Kinde",
    role: "Professional Makeup Artist",
    image: "/placeholder.svg?height=80&width=80",
    content:
      "After completing my course with BBMI, I was offered a jib within the academy, which has allowed me to gain invaluable exprience and build a strong network. BBMI has truley helped me live out my passion.",
    rating: 5,
  },
  {
    id: 2,
    name: "Rihanna Murad",
    role: "BBMI Team Staff Member",
    image: "/placeholder.svg?height=80&width=80",
    content:
      "My name is Rihanna Murad. I will forever be grateful to BBMI for changing my life. I couldn't afford the of the courses, but they gave me a free opportunity to learn and follow my passion. Through their support, I completed my classes and gained invaluable skills",
    rating: 5,
  },
  {
    id: 3,
    name: "Kidus Tariku",
    role: "Skilled Makeup Artist",
    image: "/placeholder.svg?height=80&width=80",
    content:
      "My name is Kidus and i am a young person with a hearing disability. Thanks to free scholarship i received from BBMI, i was able to follow my passion for make up. The acadamy ot only provided me with execptional training but also ensured me i had a translator to support me throughout my learning journey. ",
    rating: 5,
  },
  {
    id: 4,
    name: "Natinahel Mohamed",
    role: "Beauty Entrepreneur",
    image: "/placeholder.svg?height=80&width=80",
    content:
      "My name is Nati, and i'm proud to be breaking barriers in the makeup industry as an Ethiopian men. In a trend where men are not often encouraged to pursue this path, BBMI inspired me with theit acceptance and unwaving support.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-white to-purple-50">
  <div className="container mx-auto px-4">
    <BlurFade className="text-center mb-16">
      <AnimatedGradientText text="What Our Students Say" className="text-4xl md:text-5xl font-bold mb-4" />
      <p className="text-lg text-black-600 max-w-2xl mx-auto">
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
                  <Star key={i} className="w-5 h-5 fill-custom-tan text-custom-tan" />
                ))}
              </div>

              <blockquote className="text-black-700 mb-6 text-lg leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              <div className="flex items-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 ring-4 ring-custom-tan">
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
                  <p className="text-custom-tan font-medium">
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
