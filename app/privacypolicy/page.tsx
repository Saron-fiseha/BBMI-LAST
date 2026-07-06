"use client"

import React from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Shield, Eye } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F1E9]">
      <SiteHeader />
      
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-xl border border-white/50">
          
          {/* Header Block */}
          <div className="border-b border-gray-200 pb-8 mb-8 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CA9C73]/10 text-xs font-bold uppercase tracking-wider text-[#71423E] mb-4">
              <Eye className="w-3.5 h-3.5" /> Privacy & Protection
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#71423E] tracking-tight">
              Data Protection & Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-semibold tracking-wide uppercase">
              Brushed by Betty Beauty Institution (BBMI)
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 rounded-2xl bg-[#FBF9F4] border border-[#CA9C73]/15 text-sm">
            <div>
              <p className="text-gray-500 font-bold uppercase text-xs">Document Type</p>
              <p className="text-gray-800 font-medium">Institutional Data Protection & Privacy Policy</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase text-xs">Effective Date</p>
              <p className="text-gray-800 font-medium">June 2, 2015</p>
            </div>
            <div className="md:mt-2">
              <p className="text-gray-500 font-bold uppercase text-xs">Target Audience</p>
              <p className="text-gray-800 font-medium">Website Users, Course Applicants, Registered Students, Alumni, and Staff</p>
            </div>
            <div className="md:mt-2">
              <p className="text-gray-500 font-bold uppercase text-xs">Governing Law</p>
              <p className="text-gray-800 font-medium">Federal Democratic Republic of Ethiopia (FDRE) Data Protection Regulation & Proclamations</p>
            </div>
          </div>

          {/* Document Content */}
          <div className="space-y-8 text-gray-800 leading-relaxed text-base">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                1. INTRODUCTION & INSTITUTIONAL PROFILE
              </h2>
              <p>
                Brushed by Betty Beauty Institution (BBMI), operating formally under the licensing and regulation authority of the <span className="font-semibold text-gray-900">Addis Ababa City Administration Education and Training Quality Assurance Authority</span>, is a premier technical vocational education academy specializing in professional cosmetologically sciences, makeup artistry, advanced skincare, hair formatting, nail styling, and entrepreneurial life-skills frameworks.
              </p>
              <p>
                Originally founded in 2010 E.C. (2018 G.C.) by <span className="font-semibold text-gray-900">Bethlehem Eskinder (Founder & Chief Executive Officer)</span> as a specialized regional aesthetic service bureau, the center formally converted into an expanded technical enterprise academy in 2013 E.C., escalating single-term instructional accommodation capabilities from an initial batch of 16 registrants to a standardized handling throughput exceeding 1,500 active physical trainees simultaneously across multiple branches.
              </p>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border-l-4 border-[#CA9C73] italic text-sm text-gray-600 my-4">
                &ldquo;With every stroke of the brush, we turn art into a professional lifecycle.&rdquo; BBMI binds absolute practical craftsmanship technical execution alongside deep-rooted professional accountability, ensuring consumer data systems adhere to identical structural standards.
              </div>
              
              <div className="space-y-3 pl-4 mt-4">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">1.1 Operational Governance Structure</h3>
                <p>
                  BBMI manages highly clear technical workflows where operations link transparent structural tiers to guarantee institutional enforceability of data directives:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>
                    <span className="font-bold">CEO / Founder Office:</span> Executes ultimate legal and existential oversight, ensuring information systems balance corporate investment against national regulatory frameworks.
                  </li>
                  <li>
                    <span className="font-bold">General Manager:</span> Directs day-to-day administrative processing, handling intra-departmental data coordination and serving as the foundational reporting line for systemic compliance audits.
                  </li>
                  <li>
                    <span className="font-bold">Functional Core Management:</span> Controls cross-functional structural departments encompassing the Finance Unit (Casher processing), HR Division, Marketing Group, and separate Branch Managers managing regional on-site offices (including Registrars and Reception desks).
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                2. PURPOSE & SCOPE OF THE POLICY
              </h2>
              <div className="space-y-3 pl-4 border-l-2 border-[#CA9C73]/30">
                <div>
                  <h3 className="font-bold text-gray-900">2.1 Core Purpose</h3>
                  <p>
                    This comprehensive Data Protection and Privacy Policy defines the operational terms, systemic configurations, and legal criteria through which BBMI handles computational, structural, physical, and historical metrics. It explicitly balances business processing workflows against individuals' privacy protections, building accountability regarding automated record management, student registries, payment tracking mechanisms, and internet presence architectures.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">2.2 Definitive Scope of Coverage</h3>
                  <p>
                    This institutional policy applies universally across all organizational facilities, online configurations, and transactional networks owned, operated, or mediated by BBMI. The compliance mandates herein strictly bind the following dataset entities:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
                    <li>
                      <span className="font-bold">Website Browsers & Applicants:</span> Individual users navigating the corporate web-portal, submitting entry questionnaires, interacting with embedded contact channels, or initiating remote registration tracking.
                    </li>
                    <li>
                      <span className="font-bold">Enrolled Trainees / Students:</span> Active technical registrants navigating curriculum requirements, undergoing regular evaluation, receiving specialized financial aid distributions, or participating in institutional studio exercises.
                    </li>
                    <li>
                      <span className="font-bold">Trainers, Employees & Staff:</span> Instructional faculty, administrative desk officers, specialized financial cashers, outsourced security details, and registry clerks processing internal student management files.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                3. DATA COLLECTION MATRIX (CATEGORIZED SPECIFICATIONS)
              </h2>
              <p>
                BBMI collects strictly delimited categories of data necessary for operational execution, educational certification, and professional branding. The matrix below defines these elements:
              </p>
              
              {/* Data Collection Table */}
              <div className="overflow-x-auto my-4 border border-gray-200 rounded-xl text-xs sm:text-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#FAF8F5]">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-[#71423E]">Data Category</th>
                      <th className="px-4 py-3 text-left font-bold text-[#71423E]">Specific Metrics Collected</th>
                      <th className="px-4 py-3 text-left font-bold text-[#71423E]">Operational Capture Channel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Identity & Personal Data</td>
                      <td className="px-4 py-3">Legal Full Name, Date of Birth, Gender, National Identity Identification Number, Permanent Housing Address, Active Telephone/Mobile Contact Lines, Personal Electronic Mail Address.</td>
                      <td className="px-4 py-3 font-medium">Physical Entry Registers, Web-Portal Inquiries, Academic Intake Forms.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Educational History</td>
                      <td className="px-4 py-3">Prior Secondary Certification, Transcript Portfolios, Internal Classroom Attendance Records, Technical Skill Evaluation Scores, Practical Workshop Completion Checklists.</td>
                      <td className="px-4 py-3 font-medium">Registrar Intake Desk, Internal Instructor Portfolios, Performance Ledgers.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Financial & Transactional</td>
                      <td className="px-4 py-3">Bank Depositor Tracking Numbers, Bank-Issued Receipts, Cash Transaction Vouchers, Payment Installment Schedule Records, Tuition Balance Logs, SACCO Subsidy Identifiers.</td>
                      <td className="px-4 py-3 font-medium">Finance Office, On-site Cashers, Digital Banking Integration Portfolios.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Promotional Media / Content</td>
                      <td className="px-4 py-3">High-Definition Portrait Images, Classroom Practical Workshop Recordings, Graduation Ceremony Coverage, Specialized Testimonial Quotations, Studio Portfolios.</td>
                      <td className="px-4 py-3 font-medium">Official Institutional Media Coverage, Studio Photographic Sessions.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Web Analytics / Digital</td>
                      <td className="px-4 py-3">Internet Protocol (IP) Coordinates, Web Browser Configurations, Navigational Clickstream Trails, Core Cookie Indicators, Form Interaction Timing Profiles.</td>
                      <td className="px-4 py-3 font-medium">Automated Corporate Web Server Logging, Analytic Script Interfaces.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                4. OPERATIONAL PURPOSES OF DATA PROCESSING
              </h2>
              <p>
                BBMI utilizes internal personal data assets exclusively for authorized educational and structural workflows. Processing objectives are structured into explicit execution blocks:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <span className="font-bold">4.1 Academic & Student Management:</span> Processing identities facilitates student placement indexing, tracks attendance patterns, coordinates curriculum rotation, and archives grade tracking tables to verify vocational certification eligibility under national accreditation benchmarks.
                </li>
                <li>
                  <span className="font-bold">4.2 Curricular Execution & Technical Studio Production:</span> Instructional teams use tracking portfolios to design studio spaces, adjust makeup product provisions based on safety registries, coordinate live masterclasses, and format instructional media displays mirroring international professional cosmetic standards.
                </li>
                <li>
                  <span className="font-bold">4.3 Financial Accountability & Auditing:</span> The Finance Office processes transactional indices to cross-reference multi-tier installation payments, track balance defaults, clear corporate accounting ledgers, and manage formal data returns submitted directly to national commercial banks or micro-finance entities.
                </li>
                <li>
                  <span className="font-bold">4.4 Strategic Institutional Advancement & Promotion:</span> Media records, photography, and student quotes support public marketing, build social media assets highlighting vocational success, illustrate terminal graduation showcases, and substantiate the institution's localized societal growth initiatives.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                5. LEGAL BASIS FOR PROCESSING
              </h2>
              <p>
                To guarantee strict adherence to local regulatory expectations, processing at BBMI requires a verified legal basis. Processing relies explicitly upon four functional justifications:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <span className="font-bold">Contractual Obligations:</span> The execution of operations required to validate academic registration, execute course processing agreements, manage structural tuition installments, and issue verified technical performance certifications.
                </li>
                <li>
                  <span className="font-bold">Informed Consent:</span> Explicit, un-coerced, written or electronic consent marked voluntarily by website navigators, applicants, or incoming students upon completion of processing templates or media waivers.
                </li>
                <li>
                  <span className="font-bold">Regulatory Compliance & Legal Requirements:</span> Processing mandatory to satisfy operational mandates, architectural compliance audits, educational performance reporting, tax compliance validations, or standard local corporate accountability reporting rules.
                </li>
                <li>
                  <span className="font-bold">Legitimate Institutional Interest:</span> The handling of parameters strictly required to stabilize electronic networks, secure operational environments, prevent identity manipulation, or coordinate strategic educational partnerships.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                6. DATA SHARING & THIRD-PARTY DISCLOSURES
              </h2>
              <p>
                BBMI enforces strict protocols prohibiting the sale, lease, or unauthorized distribution of consumer personal data. External transmission occurs exclusively through authorized operational vectors:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <span className="font-bold">6.1 Educational & Regulatory Authorities:</span> Student technical data, transcript portfolios, and compliance matrices are transmitted directly to the Addis Ababa City Administration Education and Training Quality Assurance Authority, the Ministry of Labor and Skills, and official federal certification bodies for professional competency validation.
                </li>
                <li>
                  <span className="font-bold">6.2 Financial Entities & Commercial Banking Outlets:</span> Payment documentation, micro-finance loan applications, and collateral backing records flow through verified secure transmission lines to designated local banking outlets to clear corporate accounting records.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                7. PHOTOGRAPHY, VIDEO, & TESTIMONIAL CONSENT FRAMEWORK
              </h2>
              <p>
                Given the deeply visual nature of makeup artistry, cosmetology, and styling disciplines, BBMI captures media records to illustrate instructional practices and celebrate professional milestones. This processing follows a specialized consent framework:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <span className="font-bold">7.1 Targeted Production Scenarios:</span> Media capture is strictly constrained to standard instructional environments, encompassing high-definition studio session documentation, live interactive classroom practical demonstrations, final practical grading evaluations, terminal graduation ceremony celebrations, and pre-arranged success story video interviews.
                </li>
                <li>
                  <span className="font-bold">7.2 Voluntary Testimonial Promotion:</span> Student testimonials including those from diverse cohorts, such as our recorded success pathways for students with specialized needs are deployed for public promotion exclusively following direct validation from the participant. These profiles emphasize career evolution, self-reliance, and specialized skill mastery achieved inside our spaces.
                </li>
                <li>
                  <span className="font-bold">7.3 Revocation of Media Authorizations:</span> Enrolled trainees maintain the right to adjust or withdraw consent regarding marketing media exposure. Revocation requests must be submitted via a written notice to the Marketing and Branch Management Office. Upon approval, the institution will remove relevant digital imagery from active campaigns within thirteen (30) working days and exclude those files from future physical print materials.
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                8. DATA SECURITY, RETENTION, & TECHNICAL INDICES
              </h2>
              <div className="space-y-3 pl-4 border-l-2 border-[#CA9C73]/30">
                <div>
                  <h3 className="font-bold text-gray-900">8.1 Data Storage & Technical Security Safeguards</h3>
                  <p>
                    BBMI deploys a layered security infrastructure combining localized physical defenses with structured digital encryption layers. On-site paper-based registries are locked inside secure file cabinets at registry archiving zones. Digital registries are protected by customized local access permissions, multi-factor credential requirements for database managers, regular off-site backup storage routines, and active network screening configurations on administrative systems.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">8.2 Defined Retention Windows</h3>
                  <p>
                    To guarantee compliance with corporate, tax, and educational archiving mandates, data is maintained under strict retention rules:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-4 mt-2">
                    <li>
                      <span className="font-bold">Official Student Registries & Transcript Data:</span> Maintained permanently within core registrar databases to support long-term validation queries, credential replacement requests, and professional reference archiving.
                    </li>
                    <li>
                      <span className="font-bold">Financial Invoices, Deposit Slips, & Payment Logs:</span> Maintained for seven (7) fiscal years to satisfy structural tax auditing requirements and national financial inspection rules.
                    </li>
                    <li>
                      <span className="font-bold">Promotional Media Assets & Marketing Portfolios:</span> Maintained for five (5) calendar years from collection or until consent is explicitly revoked by the participant.
                    </li>
                    <li>
                      <span className="font-bold">General Course Applications & Incomplete Profiles:</span> Deleted or thoroughly anonymized within ninety (90) days from course completion, unless the applicant advances into active enrollment.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                9. INDIVIDUAL RIGHTS & DATA SUBJECT PORTALS
              </h2>
              <p>
                Under applicable data regulations, website users, applicants, and active students at BBMI retain clear, actionable rights regarding their personal data assets:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <span className="font-bold">Right of Access:</span> The right to demand a clear statement detailing all personal data elements maintained inside the academy's databases, including processing rationales and disclosure logs.
                </li>
                <li>
                  <span className="font-bold">Right of Correction / Rectification:</span> The right to demand correction of inaccurate identity metrics, update changing contact numbers, adjust financial logs, or amend prior educational historical listings.
                </li>
                <li>
                  <span className="font-bold">Right of Deletion / Erasure:</span> The right to demand permanent deletion of personal metrics from active online systems, provided the data isn't bound to active contractual obligations or tuition balance calculations.
                </li>
                <li>
                  <span className="font-bold">Right to Withdraw Consent:</span> The right to withdraw processing permissions linked to marketing lists, informational circulars, or web-analytics collection at any point.
                </li>
              </ul>
            </section>

            {/* Section 10 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                10. CRISIS PROTOCOLS & DATA BREACH MANAGEMENT
              </h2>
              <p>
                In the event of a verified operational network compromise, systemic data filtration, or unauthorized access to registry archives, BBMI initiates a rapid deployment security sequence coordinated directly by the General Manager's office:
              </p>
              <ol className="list-decimal list-inside space-y-2 pl-2 font-medium">
                <li>
                  <span className="font-bold text-gray-900">Isolation & Perimeter Containment:</span> Technical teams isolate impacted storage networks, modify structural entry passwords, deactivate breached server portals, and launch an emergency forensic audit of the network logs.
                </li>
                <li>
                  <span className="font-bold text-gray-900">Systematic Impact Evaluation:</span> A full institutional audit evaluates the precise scope of compromised metrics, identifies specific affected cohorts, and reviews the security systems involved.
                </li>
                <li>
                  <span className="font-bold text-gray-900">Regulatory & Stakeholder Notification:</span> BBMI will issue an official data security notification to all impacted individuals within seventy-two (72) hours of breach verification. This notice provides clear guidance on credential modification and outlines the corrective technical measures implemented by the academy.
                </li>
              </ol>
            </section>

            {/* Section 11 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                11. POLICY REVISIONS & AMENDMENTS
              </h2>
              <p>
                BBMI maintains the right to update, modify, or rewrite sections of this privacy policy to match evolving technical configurations, changing administrative structures, or new federal data protection proclamations. Revisions will be published on our web portal with updated version numbers. Continued interaction with BBMI portals or active attendance at physical campuses constitutes acceptance of the updated privacy policy terms.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] border-b border-[#CA9C73]/20 pb-2">
                12. COMPLAINTS & GOVERNANCE CONTACT CHANNELS
              </h2>
              <p>
                For formal inquiries, data access requests, credential corrections, or to file privacy complaints, please contact our administrative management center through these designated institutional channels:
              </p>
              
              {/* Complaints Table */}
              <div className="overflow-x-auto my-4 border border-gray-200 rounded-xl text-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-bold text-[#71423E] bg-[#FAF8F5] w-1/3">Institutional Title</td>
                      <td className="px-4 py-3">Brushed by Betty Beauty Institution (BBMI)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-[#71423E] bg-[#FAF8F5]">Primary Branch Location</td>
                      <td className="px-4 py-3">Bole Sub-City, Addis Ababa, Ethiopia</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-[#71423E] bg-[#FAF8F5]">Responsible Compliance Officer</td>
                      <td className="px-4 py-3">Administrative Registry Desk</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-[#71423E] bg-[#FAF8F5]">Administrative Telephone Line</td>
                      <td className="px-4 py-3">+251-11- / +251-91-(Standard Business Hours)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 13 */}
            <section className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#CA9C73]/10 space-y-3">
              <h2 className="text-xl font-bold text-[#71423E] flex items-center gap-2">
                <Shield className="w-5 h-5" /> 13. OFFICIAL INSTITUTIONAL CONSENT STATEMENT
              </h2>
              <p className="text-xs uppercase tracking-wide font-bold text-gray-600">
                &ldquo;BY SIGNING THE PHYSICAL ACADEMIC INTAKE REGISTER, SUBMITTING INQUIRY QUESTIONNAIRES ON OUR DIGITAL WEB PORTALS, OR CONCLUDING FORMAL COURSE ENROLLMENT PROCESSING WITH BBMI REGISTRARS, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND VOLUNTARILY AGREE TO THE MANDATES, DATA PROCESSING COLLECTION RULES, RETENTION CRITERIA, AND SHARING TERMS OUTLINED IN THIS DATA PROTECTION AND PRIVACY POLICY.&rdquo;
              </p>
            </section>
          </div>
          
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
