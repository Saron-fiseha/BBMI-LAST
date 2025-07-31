"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// BlurFade component for animations
const BlurFade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 duration-1000"
      style={{ animationDelay: `${delay * 1000}ms` }}
    >
      {children}
    </div>
  )
}

const faqs = [
  {
    question: "What courses do you offer?",
    answer:
      "We offer a wide range of courses including web development, mobile app development, data science, machine learning, and digital marketing. All our courses are designed by industry experts and updated regularly to match current market demands.",
  },
  {
    question: "How long are the courses?",
    answer:
      "Course duration varies depending on the subject and depth of content. Most of our courses range from 4-12 weeks, with flexible scheduling options including part-time and full-time tracks to accommodate different learning preferences.",
  },
  {
    question: "Do you provide certificates?",
    answer:
      "Yes, we provide industry-recognized certificates upon successful completion of each course. Our certificates are valued by employers and can help boost your career prospects in the tech industry.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "We offer a 30-day money-back guarantee for all our courses. If you're not satisfied with the course content or teaching quality within the first 30 days, you can request a full refund with no questions asked.",
  },
  {
    question: "Do you offer job placement assistance?",
    answer:
      "We provide comprehensive job placement assistance including resume building, interview preparation, portfolio development, and direct connections with our hiring partners. Our career support team works with you until you land your dream job.",
  },
  {
    question: "Can I access course materials after completion?",
    answer:
      "Yes, you get lifetime access to all course materials, including video lectures, assignments, and resources. You can revisit the content anytime and also receive updates when we add new materials to the course.",
  },
]

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-20">
      <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm ">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-600 to-slate-900 bg-clip-text text-transparent mb-5">
            Frequently Asked Questions
          </CardTitle>
          <CardDescription className="text-black-600 text-lg mb-5">
            Find answers to common questions about our courses and services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <BlurFade key={index} delay={index * 0.1}>
                <Collapsible open={openFaq === index} onOpenChange={() => toggleFaq(index)}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-muted/50 border-mustard text-charcoal mb-3">
                    <span className="font-medium">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="h-4 w-4 text-mustard" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-mustard" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 text-gray-700">
                    <p>{faq.answer}</p>
                  </CollapsibleContent>
                </Collapsible>
              </BlurFade>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
