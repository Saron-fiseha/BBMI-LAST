"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Clock, Users, BookOpen, CheckCircle, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { TextAnimate } from "@/components/magicui/text-animate"
import { ShinyButton } from "@/components/magicui/shiny-button"
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import { BlurFade } from "@/components/magicui/blur-fade"
import { NumberTicker } from "@/components/magicui/number-ticker"
// --- ADDED: Import useEffect and dynamic ---
// import { useEffect } from 'react'
import dynamic from 'next/dynamic'
// import { pdfjs } from "react-pdf"

const CertificationsCarousel = dynamic(
  () => import('@/components/CertificationsCarousel'), // Path to your new component
  {
    ssr: false, // This is still crucial for preventing server-side errors
    loading: () => <div className="text-center p-4">Loading certificates...</div>,
  }
);


export default function AboutPage() {
  // --- UPDATED: Changed pdfSrc to imageSrc and updated file extensions to .jpg ---
  const certificateData = [
    {
      id: 1,
      imageSrc: "/certificates/sma-certificate.jpg",
      alt: "Certificate of Attendance from SMA International Makeup Academy",
    },
    {
      id: 2,
      imageSrc: "/certificates/raphael-oliver-certificate.jpg",
      alt: "Certificate of Specialization from Raphael Oliver",
    },
    {
      id: 3,
      imageSrc: "/certificates/taya-appreciation-certificate.jpg",
      alt: "Certificate of Appreciation from TaYA",
    },
  ];


  // Mock team members with email and phone
  const teamMembers = [
    {
      name: "Betelhem Eskinnder",
      role: "Founder and CEO",
      image: "/betty's-pic-2.png",
      email: "brushedbybetty@gmail.com ",
      phone: "0911208157",
    },
    {
      name: "Kalkidan Eyob",
      role: "Manager/operation",
      image: "/placeholder.svg?height=200&width=200",
      email: "[EMAIL_ADDRESS]",
      phone: "[PhoneNumber]",
    },
    {
      name: "Liya Ekinder",
      role: "Manager/Administration",
      image: "/placeholder.svg?height=200&width=200",
      email: "[EMAIL_ADDRESS]",
      phone: "[PhoneNumber]",
    },
    {
      name: "Esayas Tesfaye",
      role: "Strategic Advisor",
      image: "/placeholder.svg?height=200&width=200",
      email: "[EMAIL_ADDRESS]",
      phone: "[PhoneNumber]",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#FCF9F3] via-[#F5F1E9] to-[#EBE4D5] relative overflow-hidden min-h-[480px] lg:h-[500px] flex items-center">
          <div className="absolute top-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-[#EAD0B7]/25 blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10 py-12 lg:py-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <TextAnimate
                  text="About BBMI Makeup"
                  className="text-4xl md:text-5xl font-extrabold text-[#71423E] tracking-tight mb-2"
                />
                <TextAnimate
                  text="We're dedicated to providing world-class beauty education that transforms passion into successful careers."
                  className="text-lg md:text-xl text-gray-700 font-medium leading-relaxed mb-6"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <ShinyButton href="/courses" size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-[#71423E] to-[#5C4033]">
                    Explore Courses
                  </ShinyButton>
                  <InteractiveHoverButton
                    href="/contact"
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-4 border border-[#CA9C73]/40 text-gray-800 hover:bg-[#D1A392]/20 backdrop-blur-sm"
                  >
                    Contact Us
                  </InteractiveHoverButton>
                </div>
              </div>
              
              {/* Mobile Image Stack (Hidden on desktop) */}
              <div className="block lg:hidden w-full max-w-[550px] mx-auto">
                <div className="relative w-full aspect-[4/3] overflow-hidden shadow-lg">
                  <img
                    src="/about-new2.jpg"
                    alt="BBMI Academy campus"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5C4033]/30 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Full-Bleed Image (Hidden on mobile) */}
          <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-[42%] h-full overflow-hidden">
            <img
              src="/about-new2.jpg"
              alt="BBMI Academy campus"
              className="w-full h-full object-cover"
            />
            {/* Soft overlay gradient to blend the image edge with the background */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#F5F1E9] to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#5C4033]/20 via-transparent to-transparent z-10 pointer-events-none" />
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <BlurFade>
            <div className="container">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <TextAnimate text="Our Story" className="text-3xl font-bold mb-4" />
                <TextAnimate
                  text="Founded by Betelhem Eskinder in 2019 as a beauty salon, Brushed By Betty Makeup Academy began with a simple mission: to deliver world-class beauty education through hands-on training, expert instructors, and a curriculum aligned with the latest trends and best practices in the global beauty industry."
                  className="text-muted-foreground"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <TextAnimate
                    className="mb-2"
                    text="BBMI Makeup is a premier beauty training institution specializing in professional courses for makeup, nail care, and eyelash extensions. Founded by Betelhem Eskinder in 2019 as a beauty salon."
                  />
                  <TextAnimate
                    className="mb-2"
                    text="It was officially licensed in 2021 by the Addis Ababa City Administration Education and Training Quality Regulation Authority (ETQRA) as Brushed by Betty Makeup Institution Starting with just sixteen students, the academy has grown significantly and now has the capacity to train over 300 students per session."
                  />
                  <TextAnimate
                    text="BBMI Makeup is dedicated to empowering individuals with technical skills and entrepreneurial knowledge to succeed in the rapidly growing beauty industry. Our training programs are designed to meet both local and international beauty standards, fostering a new generation of qualified beauty professionals."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-6 rounded-lg text-center transition-transform duration-300 hover:-translate-y-2">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/20 text-custom-brown mb-4">
                      <Users className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      <NumberTicker value={4500} />+
                    </h3>
                    <p className="text-custom-copper">Graduates</p>
                  </div>
                  <div className="bg-muted p-6 rounded-lg text-center transition-transform duration-300 hover:-translate-y-2">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/20 text-custom-brown mb-4">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      <NumberTicker value={25} />+
                    </h3>
                    <p className="text-custom-copper">Courses</p>
                  </div>
                  <div className="bg-muted p-6 rounded-lg text-center transition-transform duration-300 hover:-translate-y-2">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/20 text-custom-brown mb-4">
                      <Award className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      <NumberTicker value={15} />+
                    </h3>
                    <p className="text-custom-copper">Industry Awards</p>
                  </div>
                  <div className="bg-muted p-6 rounded-lg text-center transition-transform duration-300 hover:-translate-y-2">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/20 text-custom-brown mb-4">
                      <Clock className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      <NumberTicker value={10} />+
                    </h3>
                    <p className="text-custom-copper">Years of Excellence</p>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-[#F5F1E9]">
          <BlurFade>
            <div className="container">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <TextAnimate text="Our Values" className="text-3xl font-bold mb-4" />
                <TextAnimate
                  text="These core principles guide everything we do at BBMI."
                  className="text-muted-foreground"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="transition-transform duration-300 hover:-translate-y-2">
                  <CardContent className="pt-6">
                    <div className="mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-primary/20 text-custom-brown">
                      <Award className="h-6 w-6" />
                    </div>
                    <TextAnimate text="Excellence" className="text-xl font-bold mb-2" />
                    <TextAnimate
                      text="We're committed to maintaining the highest standards in beauty education, constantly updating our curriculum to reflect industry innovations."
                      className="text-muted-foreground"
                    />
                  </CardContent>
                </Card>
                <Card className="transition-transform duration-300 hover:-translate-y-2">
                  <CardContent className="pt-6">
                    <div className="mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-primary/20 text-custom-brown">
                      <Users className="h-6 w-6" />
                    </div>
                    <TextAnimate text="Inclusivity" className="text-xl font-bold mb-2" />
                    <TextAnimate
                      text="We believe beauty education should be accessible to all, regardless of background, and our courses are designed to accommodate diverse learning styles."
                      className="text-muted-foreground"
                    />
                  </CardContent>
                </Card>
                <Card className="transition-transform duration-300 hover:-translate-y-2">
                  <CardContent className="pt-6">
                    <div className="mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-primary/20 text-custom-brown">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <TextAnimate text="Integrity" className="text-xl font-bold mb-2" />
                    <TextAnimate
                      text="We operate with transparency and honesty, ensuring our students receive the education and support they've been promised."
                      className="text-muted-foreground"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </BlurFade>
        </section>

        {/* --- CERTIFICATIONS SECTION --- */}
        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our Commitment to Excellence
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                We are dedicated to continuous learning and professional development, holding certifications from globally recognized makeup artists and institutions.
              </p>
            </div>
            <div className="w-full max-w-5xl mx-auto">
              {/* This now passes the image data to the carousel */}
              <CertificationsCarousel certificates={certificateData} />
            </div>
          </div>
        </section>


        {/* Our Team */}
        <section className="py-16">
          <BlurFade>
            <div className="container">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Leadership Team</h2>
                <p className="text-muted-foreground">
                  Meet the dedicated professionals who make BBMI a leader in beauty education.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-4 aspect-square relative overflow-hidden rounded-full">
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="object-cover object-top scale-110 w-full h-full"
                      />
                    </div>
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-muted-foreground">{member.role}</p>
                    {/* --- UPDATED: Changed text-primary to text-custom-brown --- */}
                    <div className="mt-2 flex justify-center items-center gap-4 text-sm text-custom-copper">
                      <a href={`mailto:${member.email}`} className="flex items-center gap-1 hover:underline">
                        <Mail size={14} />
                        Email
                      </a>
                      <a href={`tel:${member.phone}`} className="flex items-center gap-1 hover:underline">
                        <Phone size={14} />
                        Call
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
        </section>


        {/* CTA */}
        <section className="py-16 bg-warm-rose text-black">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to Start Your Beauty Career?</h2>
              <p className="text-lg opacity-90">
                Join BBMI today and transform your passion into a successful career in the beauty industry.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <ShinyButton href="/courses" size="lg" className="bg-white text-black hover:bg-gray-200">
                  Browse Courses
                </ShinyButton>
                <InteractiveHoverButton
                  href="/register"
                  variant="outline"
                  size="lg"
                  className="border-white text-black hover:bg-white hover:text-black"
                >
                  Register Now
                </InteractiveHoverButton>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
