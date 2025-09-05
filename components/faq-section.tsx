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
    question: "What courses do you offer at BBMI?",
    answer:
      "BBMI offers a comprehensive range of courses including Professional Makeup Artistry, Skincare Fundamentals, Bridal & Editorial Makeup, Special Effects (SFX) Makeup, and Nail Technology. All our programs are designed by leading industry experts to meet the latest beauty trends and professional standards.",
  },
  {
    question: "How long are the courses?",
    answer:
      "Course duration varies based on the program's intensity. Our intensive certification programs typically range from 4 to 12 weeks, while specialized workshops may be a few days. We offer flexible scheduling with both full-time weekday and part-time weekend classes to fit your lifestyle.",
  },
  {
    question: "Do you provide certificates upon completion?",
    answer:
      "Yes, upon successful completion of any of our certification programs, BBMI provides an industry-recognized certificate. Our qualifications are highly respected and can help you launch or advance your career as a professional in the beauty industry.",
  },
  {
    question: "What is your enrollment and refund policy?",
    answer:
      "To enroll, a registration fee is required to secure your spot. Our refund policy is detailed in the enrollment agreement, but generally, a partial refund can be requested before the second week of class begins. The registration fee is non-refundable.",
  },
  {
    question: "Do you offer career or job placement support?",
    answer:
      "Absolutely. We are committed to our students' success beyond the classroom. BBMI offers extensive career support, including professional portfolio development, interview coaching, and networking opportunities with our industry partners, which include top salons, beauty brands, and media production houses.",
  },
  {
    question: "Will I have access to course materials after I graduate?",
    answer:
      "Yes, all BBMI graduates receive 1 year access to our online student portal. This includes all course notes, video tutorials, and resource lists. You can refresh your skills anytime and will also get updates on new techniques and materials.",
  },
];

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
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-muted/50 border-custom-copper text-charcoal mb-3">
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
