"use client"

import type React from "react"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Phone, Mail, Clock, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { BlurFade } from "@/components/magicui/blur-fade"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { ShineBorder } from "@/components/magicui/shine-border"

// FAQ array remains the same
const faqs = [
  {
    question: "How do I enroll in a course?",
    answer:
      "To enroll in a course, simply browse our course catalog, select the course you're interested in, and click 'Enroll Now'. You'll need to create an account and complete the payment process.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment system.",
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer:
      "Yes! We offer a 30-day money-back guarantee. If you're not completely satisfied with your course, contact us within 30 days of purchase for a full refund.",
  },
  {
    question: "How long do I have access to course materials?",
    answer:
      "Once you enroll in a course, you have lifetime access to all course materials, including videos, resources, and updates. You can learn at your own pace.",
  },
  {
    question: "Do you offer certificates upon completion?",
    answer:
      "Yes, all our courses come with a certificate of completion. Once you finish all course modules and pass the final assessment, you'll receive a digital certificate.",
  },
  {
    question: "Are the courses suitable for beginners?",
    answer:
      "We offer courses for all skill levels. Each course clearly indicates whether it's for beginners, intermediate, or advanced students. Check the course requirements before enrolling.",
  },
  {
    question: "Can I interact with instructors?",
    answer:
      "Our courses include Q&A sessions, discussion forums, and some offer one-on-one mentoring sessions with instructors.",
  },
  {
    question: "Do you offer group discounts?",
    answer:
      "Yes, we offer special pricing for groups of 5 or more students. Contact us directly to discuss group enrollment options and pricing.",
  },
]


export default function ContactPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // --- MODIFIED SECTION START ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Assuming your API endpoint is at '/api/contact'
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to send message. Please try again.")
      }

      // const result = await response.json(); // You can use the result if needed

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      })

      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  // --- MODIFIED SECTION END ---


  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="flex min-h-screen flex-col bg-charcoal text-ivory">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-charcoal py-12">
          <div className="container">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-ivory">Contact Us</h1>
              <p className="text-xl text-ivory max-w-2xl mx-auto">
                Have questions about our courses or need support? We're here to help!
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="container py-12 bg-charcoal">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <BlurFade delay={0.1}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-4 text-mustard" />
                  <h3 className="font-bold mb-2 text-charcoal">
                    <AnimatedGradientText text="Address" />
                  </h3>
                  <p className="text-gray-700">
                    <AnimatedShinyText text="123 Beauty Street" />
                    <br />
                    <AnimatedShinyText text="New York, NY 10001" />
                  </p>
                </CardContent>
              </Card>
            </BlurFade>
            <BlurFade delay={0.2}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Phone className="h-8 w-8 mx-auto mb-4 text-mustard" />
                  <h3 className="font-bold mb-2 text-charcoal">
                    <AnimatedGradientText text="Phone" />
                  </h3>
                  <p className="text-gray-700">
                    <AnimatedShinyText text="(123) 456-7890" />
                  </p>
                </CardContent>
              </Card>
            </BlurFade>
            <BlurFade delay={0.3}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-4 text-mustard" />
                  <h3 className="font-bold mb-2 text-charcoal">
                    <AnimatedGradientText text="Email" />
                  </h3>
                  <p className="text-gray-700">
                    <AnimatedShinyText text="info@glamouracademy.com" />
                  </p>
                </CardContent>
              </Card>
            </BlurFade>
            <BlurFade delay={0.4}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-4 text-mustard" />
                  <h3 className="font-bold mb-2 text-charcoal">
                    <AnimatedGradientText text="Hours" />
                  </h3>
                  <p className="text-gray-700">
                    <AnimatedShinyText text="Mon-Fri: 9AM-6PM" />
                    <br />
                    <AnimatedShinyText text="Sat-Sun: 10AM-4PM" />
                  </p>
                </CardContent>
              </Card>
            </BlurFade>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <ShineBorder className="w-full">
                <Card className="w-full border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Send us a Message
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-charcoal">
                            Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="border-pink-200 focus:border-pink-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-charcoal">
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="border-pink-200 focus:border-pink-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-charcoal">
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="border-pink-200 focus:border-pink-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-charcoal">
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="border-pink-200 focus:border-pink-500"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Message"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </ShineBorder>
            </div>

            {/* FAQ Section */}
            <div>
              <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Frequently Asked Questions
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Find answers to common questions about our courses and services.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {faqs.map((faq, index) => (
                      <BlurFade key={index} delay={index * 0.1}>
                        <Collapsible open={openFaq === index} onOpenChange={() => toggleFaq(index)}>
                          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-muted/50 border-mustard text-charcoal">
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
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}