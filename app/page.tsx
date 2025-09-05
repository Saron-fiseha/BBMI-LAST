import { HeroSection } from "@/components/hero-section"
import { FeaturedCourses } from "@/components/featured-courses"
import { StatsSection } from "@/components/stats-section"
import { TrustedPartners } from "@/components/trusted-partners" 
import { Testimonials } from "@/components/testimonials"
import FAQSection from "@/components/faq-section"
import { CTASection } from "@/components/cta-section"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { PersistentAuthWrapper } from "@/components/persistent-auth-wrapper"
import { AuthorSection } from "@/components/AuthorSection"
import { VideoBanner } from "@/components/VideoBanner"
import { AnnouncementsSection } from "@/components/AnnouncementsSection"

export default function HomePage() {
  return (
    <PersistentAuthWrapper>
      
      <div className="min-h-screen flex flex-col">
       <SiteHeader />
       <main className="flex-1">
         <HeroSection />
         <AuthorSection />
         <FeaturedCourses />
         <VideoBanner />
         {/* <TrustedPartners /> */}
         <StatsSection />
        <AnnouncementsSection />
         <Testimonials />
        <FAQSection />
         <CTASection />
       </main>
       <SiteFooter />
     </div>
      
    </PersistentAuthWrapper>
  )
}
