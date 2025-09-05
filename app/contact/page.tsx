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
import { MapPin, Phone, Mail, ChevronDown, ChevronUp, Loader2, Share2, Instagram, Youtube, Facebook } from "lucide-react"
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

const TikTokIcon = (props: React.ComponentProps<"svg">) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)


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
    <div className="flex min-h-screen flex-col bg-[#F5F1E9] text-ivory">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-[#F5F1E9] py-12">
          <div className="container">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-black">Contact Us</h1>
              <p className="text-xl text-black max-w-2xl mx-auto">
                Have questions about our courses or need support? We're here to help!
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="container py-12 bg-[#F5F1E9]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <BlurFade delay={0.1}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-4 text-custom-khaki" />
                  <h3 className="font-bold mb-2 text-charcoal">
                    Address
                  </h3>
                  <div className="text-gray-700">
                    <p className="mb-3"> Branch 1: 22 round about noah city point building 5th floor </p>
                    <p className="mb-3"> Branch 2: lebu mati building 3rd floor</p>
                    <p> Branch 3: summit yetebaberut, Africa convention center </p>

                  </div>
                </CardContent>
              </Card>
            </BlurFade>
            <BlurFade delay={0.2}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Phone className="h-8 w-8 mx-auto mb-4 text-custom-khaki" />
                  <h3 className="font-bold mb-2 text-charcoal">
                    Phone
                  </h3>
                  <p className="text-gray-700 mb-3">
                   +251 913218888
                  </p>
                  <p className="text-gray-700 mb-3">
                    +251 912158143
                  </p>
                  <p className="text-gray-700">
                   +251 969222888
                  </p>
                </CardContent>
              </Card>
            </BlurFade>
            <BlurFade delay={0.3}>
  <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
    <CardContent className="p-6 text-center">
      <Mail className="h-8 w-8 mx-auto mb-4 text-custom-khaki" />
      <h3 className="font-bold mb-2 text-charcoal">
        Email
      </h3>
      {/* --- THE FIX --- */}
      {/* Wrapped the email address in an <a> tag with a mailto: link */}
      <a 
        href="mailto:brushedbybetty@gmail.com" 
        className="text-gray-700 mt-8 inline-block hover:text-custom-copper hover:underline transition-colors"
      >
        brushedbybetty@gmail.com
      </a>
    </CardContent>
  </Card>
</BlurFade>
            <BlurFade delay={0.4}>
  <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
    <CardContent className="p-6 text-center">
      <Share2 className="h-8 w-8 mx-auto mb-4 text-custom-khaki" />
      <h3 className="font-bold mb-6 text-charcoal">
        Follow Us
      </h3>
      {/* --- THE FIX --- */}
      {/* 
        This div is now the main container for the links.
        - `flex flex-col`: Creates a vertical stack.
        - `items-start`: Aligns all links to the left edge of the container.
        - `w-fit mx-auto`: Makes the container only as wide as its content and centers it.
        - `space-y-4`: Adds consistent vertical spacing between each link.
      */}
      <div className="flex flex-col items-start w-fit mx-auto space-y-4 text-gray-700">
        
        {/* Each link is now a flex container for perfect icon-text alignment */}
        <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-custom-copper transition-colors">
          <Facebook className="h-5 w-5" />
          <span className="font-medium">Facebook</span>
        </a>
        
        <a href="https://www.instagram.com/brushedbybetty?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDcОMzIxNw==" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-custom-copper transition-colors">
          <Instagram className="h-5 w-5" />
          <span className="font-medium">Instagram</span>
        </a>
        
        <a href="https://youtube.com/@brushedbybetty?si=KkLOHRhAI7xoyUzE" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-custom-copper transition-colors">
          <Youtube className="h-5 w-5" />
          <span className="font-medium">YouTube</span>
        </a>
        
        <a href="https://vm.tiktok.com/ZMSTy5jY2/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-custom-copper transition-colors">
          <TikTokIcon className="h-5 w-5" />
          <span className="font-medium">TikTok</span>
        </a>
        
      </div>
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
                    <CardTitle className="text-3xl font-bold bg-custom-tan bg-clip-text text-transparent">
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
                            className="border-custom-browny focus:border-warm-rose"
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
                            className="border-custom-browny focus:border-warm-rose"
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
                          className="border-custom-browny focus:border-warm-rose"
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
                          className="border-custom-browny focus:border-warm-rose"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-custom-copper to-custom-tan hover:bg-warm-brown text-white"
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
                  <CardTitle className="text-3xl font-bold bg-custom-tan bg-clip-text text-transparent">
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
                          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-muted/50 border-custom-browny text-charcoal">
                            <span className="font-medium">{faq.question}</span>
                            {openFaq === index ? (
                              <ChevronUp className="h-4 w-4 text-custom-browny" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-custom-browny" />
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