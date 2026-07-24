"use client";

import type React from "react";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Loader2,
  Share2,
  Instagram,
  Youtube,
  Facebook,
} from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ShineBorder } from "@/components/magicui/shine-border";

// FAQ array
const faqs = [
  {
    question: "What courses do you offer at BBMI?",
    answer:
      "BBMI offers a comprehensive range of courses including Professional Makeup Artistry, Skincare Fundamentals, Bridal & Editorial Makeup, Special Effects (SFX) Makeup, and Nail Technology.",
  },
  {
    question: "How long are the courses?",
    answer:
      "Course duration varies between 4 to 12 weeks, with flexible full-time and part-time options.",
  },
  {
    question: "Do you provide certificates upon completion?",
    answer:
      "Yes, BBMI provides an industry-recognized certificate after successful completion of programs.",
  },
  {
    question: "What is your enrollment and refund policy?",
    answer:
      "A registration fee is required. Partial refunds can be requested before the 2nd week of class (registration fee non-refundable).",
  },
  {
    question: "Do you offer career or job placement support?",
    answer:
      "Absolutely. We offer portfolio building, interview prep, and industry networking opportunities.",
  },
  {
    question: "Will I have access to course materials after graduation?",
    answer:
      "Yes, graduates receive 1-year online portal access with notes, tutorials, and resources.",
  },
];

// TikTok Icon
const TikTokIcon = (props: React.ComponentProps<"svg">) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F1E9]">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#F5F1E9] py-10 sm:py-14">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-black">
                Contact Us
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-black max-w-2xl mx-auto">
                Have questions about our courses or need support? We're here to
                help! 💬
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Address */}
            <BlurFade delay={0.1}>
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-4 text-custom-khaki" />
                  <h3 className="font-bold mb-2 text-charcoal">Address</h3>
                  <p className="text-gray-700 text-sm sm:text-base">
                    Branch 1: 22 round about Noah City Point building, 5th floor
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                   Branch 2: Lebu Mati building, 3rd floor
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    Branch 3: Summit Yetebaberut, Africa Convention Center
                  </p>
                </CardContent>
              </Card>
            </BlurFade>

            {/* Phone */}
            <BlurFade delay={0.2}>
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition">
                <CardContent className="p-6 text-center">
                  <Phone className="h-8 w-8 mx-auto mb-4 text-custom-khaki" />
                  <h3 className="font-bold mb-2 text-charcoal">Phone</h3>
                  <p className="text-gray-700 text-sm sm:text-base">
                    +251 913218888
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    +251 912158143
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    +251 969222888
                  </p>
                </CardContent>
              </Card>
            </BlurFade>

            {/* Email */}
            <BlurFade delay={0.3}>
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition">
                <CardContent className="p-6 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-4 text-custom-khaki" />
                  <h3 className="font-bold mb-2 text-charcoal">Email</h3>
                  <a
                    href="mailto:betelhemesknder19@gmail.com"
                    className="text-gray-700 text-sm sm:text-base hover:text-custom-copper hover:underline"
                  >
                    brushedbybetty@gmail.com
                  </a>
                </CardContent>
              </Card>
            </BlurFade>

            {/* Socials */}
            <BlurFade delay={0.4}>
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition">
                <CardContent className="p-6 text-center">
                  <Share2 className="h-8 w-8 mx-auto mb-4 text-custom-khaki" />
                  <h3 className="font-bold mb-4 text-charcoal">Follow Us</h3>
                  <div className="flex flex-col items-start w-fit mx-auto space-y-3 text-gray-700 text-sm sm:text-base">
                    <a
                      href="https://facebook.com/brushedbybettymakeupschool"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-custom-copper"
                    >
                      <Facebook className="h-5 w-5" /> Facebook
                    </a>
                    <a
                      href="https://www.instagram.com/brushedbybetty"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-custom-copper"
                    >
                      <Instagram className="h-5 w-5" /> Instagram
                    </a>
                    <a
                      href="https://youtube.com/@brushedbybetty"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-custom-copper"
                    >
                      <Youtube className="h-5 w-5" /> YouTube
                    </a>
                    <a
                      href="https://www.tiktok.com/@brushedbybetty2?_r=1&_t=ZS-97rygqPYY8F"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-custom-copper"
                    >
                      <TikTokIcon className="h-5 w-5" /> TikTok
                    </a>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          </div>

          {/* Form + FAQ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Form */}
            <ShineBorder className="w-full">
              <Card className="w-full border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center space-y-2">
                  <CardTitle className="text-2xl sm:text-3xl font-bold bg-custom-tan bg-clip-text text-transparent">
                    Send us a Message
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm sm:text-base">
                    Fill out the form below and we'll get back to you shortly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-custom-copper to-custom-tan text-white"
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

            {/* FAQ */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-custom-tan bg-clip-text text-transparent">
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm sm:text-base">
                  Find answers to common questions about our services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {faqs.map((faq, index) => (
                    <BlurFade key={index} delay={index * 0.1}>
                      <Collapsible
                        open={openFaq === index}
                        onOpenChange={() => toggleFaq(index)}
                      >
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 sm:p-4 text-left hover:bg-muted/50 border-custom-browny text-charcoal">
                          <span className="font-medium">{faq.question}</span>
                          {openFaq === index ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-3 text-gray-700 text-sm sm:text-base">
                          <p>{faq.answer}</p>
                        </CollapsibleContent>
                      </Collapsible>
                    </BlurFade>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

