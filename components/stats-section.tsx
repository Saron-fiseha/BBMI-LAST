"use client"

import { NumberTicker } from "@/components/magicui/number-ticker"
import { FlipText } from "@/components/magicui/flip-text"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { Users, Award, BookOpen, TrendingUp } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: 500,
    label: "Students Trained",
    description: "Successful graduates working in the beauty industry",
  },
  {
    icon: Award,
    value: 15,
    label: "Expert Instructors",
    description: "Industry professionals with years of experience",
  },
  {
    icon: BookOpen,
    value: 25,
    label: "Comprehensive Courses",
    description: "Covering all aspects of beauty and wellness",
  },
  {
    icon: TrendingUp,
    value: 98,
    label: "Success Rate",
    description: "Students who successfully complete our programs",
  },
]

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-white to-purple-50 text-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <FlipText text="Why Choose BBMI?" className="text-4xl md:text-5xl font-bold mb-4" />
          <AnimatedShinyText
            text="Join thousands of successful beauty professionals who started their journey with us"
            className="text-lg text-black-500 max-w-2xl mx-auto"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="text-center group">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 bg-rose-300 rounded-full group-hover:bg-rose-300 transition-colors duration-300">
                    <IconComponent className="w-8 h-8 text-grey-500" />
                  </div>
                </div>

                <div className="mb-2">
                  <NumberTicker value={stat.value} className="text-4xl md:text-5xl font-bold text-grey-200" />
                  {stat.label.includes("Rate") && <span className="text-4xl md:text-5xl font-bold">%</span>}
                  {stat.label.includes("Students") && <span className="text-4xl md:text-5xl font-bold">+</span>}
                  {stat.label.includes("Instructors") && <span className="text-4xl md:text-5xl font-bold">+</span>}
                  {stat.label.includes("Courses") && <span className="text-4xl md:text-5xl font-bold">+</span>}
                </div>

                <h3 className="text-xl font-semibold mb-2 text-grey-200">
                  <AnimatedShinyText text={stat.label} />
                </h3>

                <p className="text-grey-100 text-sm">
                  <AnimatedShinyText text={stat.description} />
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
