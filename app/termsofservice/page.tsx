"use client"

import React from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ShieldCheck, FileText } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F1E9]">
      <SiteHeader />
      
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-xl border border-white/50">
          
          {/* Header Block */}
          <div className="border-b border-gray-200 pb-8 mb-8 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CA9C73]/10 text-xs font-bold uppercase tracking-wider text-[#71423E] mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> Confidential & Binding
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#71423E] tracking-tight">
              Terms of Service & Enrollment Agreement
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-semibold tracking-wide uppercase">
              Brushed by Betty Beauty Institution (BBMI)
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 rounded-2xl bg-[#FBF9F4] border border-[#CA9C73]/15 text-sm">
            <div>
              <p className="text-gray-500 font-bold uppercase text-xs">Document Type</p>
              <p className="text-gray-800 font-medium">Comprehensive Terms of Service & Student Agreement</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase text-xs">Regulatory Authority</p>
              <p className="text-gray-800 font-medium">Addis Ababa City Administration Education and Training Quality Assurance Authority</p>
            </div>
            <div className="md:mt-2">
              <p className="text-gray-500 font-bold uppercase text-xs">Scope of Application</p>
              <p className="text-gray-800 font-medium">Website Users, Course Applicants, and Enrolled Trainees</p>
            </div>
            <div className="md:mt-2">
              <p className="text-gray-500 font-bold uppercase text-xs">Effective Date</p>
              <p className="text-gray-800 font-medium">June 3, 2025</p>
            </div>
          </div>

          {/* Document Content */}
          <div className="space-y-8 text-gray-800 leading-relaxed text-base">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                1. PREAMBLE & BINDING CONTRACTUAL NATURE
              </h2>
              <p>
                This Agreement constitutes a legally binding contractual covenant between the applicant/trainee (&ldquo;you&rdquo; or &ldquo;the user&rdquo;) and Brushed by Betty Beauty Institution (BBMI). Accessing our website, using our online services, submitting an application, paying tuition, or participating in physical training indicates your absolute, unconditional acceptance of these terms and conditions. If you disagree with these Terms, you must not use the site, services, or enroll in classes.
              </p>
              <p>
                If the user is a parent, guardian, or custodian who allows a minor to access the services or enroll, they shall be held fully responsible for the student's conduct, access control, and compliance with this agreement.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                2. DIGITAL WEBSITE TERMS & ONLINE USE
              </h2>
              <div className="space-y-3 pl-4 border-l-2 border-[#CA9C73]/30">
                <div>
                  <h3 className="font-bold text-gray-900">2.1 Intellectual Property Restrictions</h3>
                  <p>
                    All digital interfaces, website design, course descriptions, portfolio imagery, hair/makeup design graphics, software, techniques, and text content hosted on the BBMI website or provided in training materials are the exclusive intellectual property of BBMI. Except for personal, non-commercial educational use, you may not copy, reproduce, distribute, resell, or commercially exploit any content without prior written authorization. Unauthorized distribution or reselling of materials constitutes piracy and a crime under applicable law.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">2.2 Connectivity, Equipment, and System Integrity</h3>
                  <p>
                    Users are solely responsible for all internet connection fees, telephone services, and computer equipment required to access and use BBMI&rsquo;s online services. You agree not to manipulate, interfere with, mirror, or attempt to reverse-engineer any platform or source code related to the website and services.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">2.3 Registration, Identity Protection, and Veracity</h3>
                  <p>
                    To access certain student portals or services, you must register and obtain a secure account. You are entirely responsible for maintaining account confidentiality. You agree to provide true, accurate, and current biographical data. Providing fraudulent data or falsified transcripts will result in the immediate suspension or termination of your registration portal and admission.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                3. ADMISSION CRITERIA & ENROLLMENT RULES
              </h2>
              <p>
                Admission to BBMI professional tracks requires validation of open age eligibility. Applicants must hold a minimum certification of grade six (6) or demonstrate the verified ability to read and write. Enrollment also requires the submission of a national ID card and valid academic milestone proofs. Contractual confirmation occurs exclusively when the BBMI Registrar issues an official Admission Letter.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                4. TUITION FEES, INSTALLMENT PLANS, & FINANCIAL LIABILITIES
              </h2>
              <p>
                All fees must be paid in a timely manner using valid, approved payment methods. Fees and payment milestones are strictly enforced according to the schedule below:
              </p>
              
              {/* Custom Fee Table */}
              <div className="overflow-x-auto my-4 border border-gray-200 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-[#FAF8F5]">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-[#71423E]">Fee / Payment Type</th>
                      <th className="px-4 py-3 text-left font-bold text-[#71423E]">Payment Milestones & Due Dates</th>
                      <th className="px-4 py-3 text-left font-bold text-[#71423E]">Enforcement & Penalty Matrix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Registration / Material Fee</td>
                      <td className="px-4 py-3">Due in full upon initial admission confirmation. Covers starter kit resources.</td>
                      <td className="px-4 py-3 text-red-600 font-semibold">Non-refundable under all conditions, as materials are immediately allocated.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Initial Tuition Deposit</td>
                      <td className="px-4 py-3">Minimum 100% of comprehensive tuition due prior to Day 1 of class.</td>
                      <td className="px-4 py-3 font-medium">Students cannot enter physical studios or attend orientation without this clearance.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Remaining Balance</td>
                      <td className="px-4 py-3">Divided into equal monthly payments, due on or before the 5th day of each month.</td>
                      <td className="px-4 py-3 text-gray-500">Subject to enrollment holds and portal suspension if defaults exceed grace periods.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                5. STANDARDIZED REFUND & CANCELLATION MATRIX
              </h2>
              <ul className="space-y-2 list-disc list-inside pl-2">
                <li>
                  <span className="font-bold">Withdrawal more than 7 days prior to course start date:</span> Full refund of the initial tuition deposit minus an administrative handling fee of <span className="font-bold text-[#71423E]">4,000 ETB</span>.
                </li>
                <li>
                  <span className="font-bold">Withdrawal within 1 to 7 days prior to course start date:</span> Refund is limited to fifty percent (60%) of the deposited tuition. The materials fee is fully retained by the institution.
                </li>
                <li>
                  <span className="font-bold">Withdrawal after the official launch of physical class sessions:</span> Strictly zero percent (0%) refund. The student assumes full liability for the complete remaining course balance.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                6. ACADEMIC GOVERNANCE & GRADUATION VALIDATION
              </h2>
              <p>
                To secure official vocational certification, students must strictly maintain a minimum attendance rate of eighty-five percent (90%) across their chosen instructional shift. Furthermore, a minimum aggregate grade of seventy percent (70%) is required to successfully clear technical modules and qualify for formal graduation.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                7. CAMPUS RULES OF CONDUCT, HYGIENE, & DISCIPLINE
              </h2>
              <p>
                Students must maintain the highest standards of professionalism. It is mandatory to wear the official BBMI training uniform and clean footwear, and keep hair neatly secured during studio practical sessions. Cosmetic workspaces, styling tools, and stations must be thoroughly sanitized immediately following every practical session under the direct oversight of high-level management.
              </p>
              <p>
                Students also agree to maintain professional boundaries; requesting personal contact information from tutors or assistants for offline, unauthorized business conversations is strictly prohibited.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                8. STUDENT PRACTICAL KITS & CLIENT-MODEL ARCHITECTURES
              </h2>
              <p>
                Specialized high-end cosmetology machinery, skin treatment devices, and facial units remain the exclusive property of BBMI. While student practical kits are allocated for training, students are held financially and civilly liable for any damage caused to institutional equipment due to negligence, abuse, or unauthorized use.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                9. LIABILITY WAIVERS & HEALTH DISCLOSURES
              </h2>
              <p>
                Students must fully disclose any chronic skin conditions, contact allergies, or medical sensitivities to the Registry Desk prior to the start of classes. All training, materials, and services are provided &ldquo;as is&rdquo; without express or implied warranties of a specific result. BBMI is not liable for accidental skin reactions, minor tool burns, or incidental injuries sustained during standard, supervised training exercises. You agree to indemnify and hold harmless BBMI and its representatives against all losses or claims arising from a violation of campus rules or non-disclosure of health risks.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                10. INSTITUTIONAL ALTERATIONS & FORCE MAJEURE
              </h2>
              <p>
                BBMI reserves the right to modify class schedules, adjust curriculum features, or temporarily transition to remote delivery to improve academic quality or adapt to operational requirements. Institutional delays caused by utilities, infrastructure disruptions, or regulatory updates do not justify automatic tuition refunds or cancellation of financial liability.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                11. MODIFICATIONS, TERMINATION, & SEVERABILITY
              </h2>
              <p>
                BBMI reserves the right to modify these Terms of Service at any time. Continued use of the platform or attendance at physical sessions following changes indicates acceptance of the revised terms. BBMI may terminate a student&rsquo;s portal access or physical enrollment immediately and without notice for material breaches of these Terms or campus rules. If any provision of this agreement is found unlawful or unenforceable, the remaining terms shall continue in full force and effect.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                12. AMENDMENTS, REVISIONS, & GOVERNING LAW
              </h2>
              <p>
                This Agreement is governed strictly by the laws of the Federal Democratic Republic of Ethiopia. Any disputes, grievances, or interpretations that cannot be settled amicably through institutional channels will be formally referred to competent courts in Addis Ababa.
              </p>
            </section>

            {/* Section 13 */}
            <section className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#CA9C73]/10 space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] flex items-center gap-2">
                <FileText className="w-5 h-5" /> 13. EXECUTION & ACKNOWLEDGMENT BLOCK
              </h2>
              <p className="text-xs uppercase tracking-wide font-bold text-gray-600">
                BY CHECKING THE &ldquo;I AGREE TO THE TERMS OF SERVICE&rdquo; BOX ON THE DIGITAL WEB REGISTRATION PORTAL, OR BY SIGNING BELOW, YOU CERTIFY THAT YOU HAVE READ EVERY PARAGRAPH OF THIS AGREEMENT, VERIFIED YOUR DATA, AND ACCEPT ALL RESPONSIBILITIES AND FINANCIAL LIABILITIES OUTLINED HEREIN.
              </p>
              <div className="pt-4 border-t border-gray-200 mt-4 flex flex-col sm:flex-row justify-between text-sm text-gray-500">
                <div>
                  <p className="font-bold text-gray-800">Authorized Corporate Representative</p>
                  <p>Office of the General Manager, BBMI</p>
                </div>
                <div className="mt-4 sm:mt-0 text-right">
                  <p className="text-xs">Brushed by Betty Beauty Institution</p>
                  <p className="text-[#CA9C73] font-bold">Approved Page 1 - 4</p>
                </div>
              </div>
            </section>
          </div>
          
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
