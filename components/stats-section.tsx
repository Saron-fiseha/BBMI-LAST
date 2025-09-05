"use client"

import { NumberTicker } from "@/components/magicui/number-ticker"
import { FlipText } from "@/components/magicui/flip-text"
// Removed the import for AnimatedShinyText
import { Users, Award, BookOpen, TrendingUp } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: 4500,
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
    <section className="py-20 bg-[#F5F1E9] text-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <FlipText text="Why Choose BBMI?" className="text-4xl md:text-5xl font-bold mb-4" />
          {/* Replaced AnimatedShinyText with a standard <p> tag */}
          <p className="text-lg text-black-500 max-w-2xl mx-auto">
            Join thousands of successful beauty professionals who started their journey with us
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="text-center group">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 bg-gradient-to-r from-custom-copper to-custom-tan rounded-full group-hover:bg-gradient-to-r from-custom-copper to-custom-tan transition-colors duration-300">
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

                {/* Removed AnimatedShinyText wrapper from the label */}
                <h3 className="text-xl font-semibold mb-2 text-custom-tan">
                  {stat.label}
                </h3>

                {/* Removed AnimatedShinyText wrapper from the description */}
                <p className="text-custom-tan text-sm">
                  {stat.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}