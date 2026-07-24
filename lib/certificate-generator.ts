import { sql } from "@/lib/db"

export interface CertificateData {
  userName: string
  trainingTitle: string
  completionDate: string
  certificateNumber: string
  verificationCode: string
  instructorName: string
  trainingDescription?: string
}

export async function generateCertificateNumber(userId: number, trainingId: number): Promise<string> {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, "0")

  // Get count of certificates issued this month
  const result = await sql`
    SELECT COUNT(*) as count 
    FROM certificates 
    WHERE EXTRACT(YEAR FROM created_at) = ${year} 
    AND EXTRACT(MONTH FROM created_at) = ${new Date().getMonth() + 1}
  `

  const count = Number.parseInt(result[0]?.count || "0") + 1
  const sequence = String(count).padStart(4, "0")

  return `BBMI-${year}${month}-${sequence}`
}

export function generateVerificationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createCertificateRecord(
  userId: number,
  trainingId: number,
  enrollmentId: number,
  certificateData: CertificateData,
): Promise<string> {
  try {
    console.log("Creating certificate record:", { userId, trainingId, enrollmentId, certificateData })

    const result = await sql`
      INSERT INTO certificates (
        user_id,
        training_id,
        enrollment_id,
        certificate_number,
        verification_code,
        user_name,
        training_name,
        instructor_name,
        completion_date,
        pdf_generated,
        created_at
      ) VALUES (
        ${userId},
        ${trainingId},
        ${enrollmentId},
        ${certificateData.certificateNumber},
        ${certificateData.verificationCode},
        ${certificateData.userName},
        ${certificateData.trainingTitle},
        ${certificateData.instructorName},
        ${certificateData.completionDate},
        true,
        CURRENT_TIMESTAMP
      )
      RETURNING id, certificate_number
    `

    console.log("Certificate record created:", result[0])

    // Update enrollment to mark certificate as issued
    await sql`
      UPDATE enrollments 
      SET 
        certificate_issued = true, 
        certificate_issued_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${enrollmentId}
    `

    console.log("Enrollment updated with certificate status")

    return result[0].certificate_number
  } catch (error) {
    console.error("Error creating certificate record:", error)
    throw error
  }
}

export async function checkAndGenerateCertificate(userId: number, trainingId: number): Promise<string | null> {
  try {
    console.log("Checking certificate eligibility for user:", userId, "training:", trainingId)

    // Check if user has completed the training and doesn't already have a certificate
    const enrollment = await sql`
      SELECT e.*, u.full_name, t.name as training_title, t.description as training_description
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN trainings t ON e.training_id = t.id
      WHERE e.user_id = ${userId} 
      AND e.training_id = ${trainingId}
      AND e.progress_percentage >= 100
      AND e.status = 'completed'
      AND (e.certificate_issued = false OR e.certificate_issued IS NULL)
    `

    console.log("Enrollment check result:", enrollment)

    if (enrollment.length === 0) {
      console.log("Not eligible for certificate or already has one")
      return null
    }

    const enrollmentData = enrollment[0]

    // Get instructor name
    const instructor = await sql`
      SELECT u.full_name as instructor_name
      FROM trainings t
      LEFT JOIN users u ON t.instructor_id = u.id
      WHERE t.id = ${trainingId}
    `

    const instructorName = instructor[0]?.instructor_name || "Ms Betelhem"

    // Generate certificate data
    const certificateNumber = await generateCertificateNumber(userId, trainingId)
    const verificationCode = generateVerificationCode()

    const certificateData: CertificateData = {
      userName: enrollmentData.full_name,
      trainingTitle: enrollmentData.training_title,
      completionDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      certificateNumber,
      verificationCode,
      instructorName,
      trainingDescription: enrollmentData.training_description,
    }

    console.log("Generated certificate data:", certificateData)

    // Store in database
    const createdCertificateNumber = await createCertificateRecord(
      userId,
      trainingId,
      enrollmentData.id,
      certificateData,
    )

    console.log("Certificate created successfully:", createdCertificateNumber)

    return createdCertificateNumber
  } catch (error) {
    console.error("Error generating certificate:", error)
    throw error
  }
}

export async function getCertificateByUserAndTraining(userId: number, trainingId: number) {
  try {
    const result = await sql`
      SELECT * FROM certificates 
      WHERE user_id = ${userId} AND training_id = ${trainingId}
      ORDER BY created_at DESC
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching certificate:", error)
    return null
  }
}

// PDF Generation using HTML/CSS (simpler approach)
export function generateCertificateHTML(data: CertificateData): string {
return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>BBMI Certificate</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background: #111;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1123px;
      height: 794px;
      overflow: hidden;
    }
    @media print {
      html, body {
        width: 1123px;
        height: 794px;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: #111 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .certificate {
        width: 1123px !important;
        height: 794px !important;
        background: radial-gradient(ellipse at 50% 30%, #2a2a2a 0%, #141414 60%, #0d0d0d 100%) !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
 
    .certificate {
      width: 1123px;
      height: 794px;
      background: radial-gradient(ellipse at 50% 30%, #2a2a2a 0%, #141414 60%, #0d0d0d 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
 
    /* ── Corners ── */
    .corner { position: absolute; pointer-events: none; }
    .corner-tl { top: 0; left: 0; width: 210px; }
    .corner-tr { top: 0; right: 0; width: 210px; }
    .corner-bl { bottom: 0; left: 0; width: 170px; }
    .corner-br { bottom: 0; right: 0; width: 170px; }
 
    /* ── Content ── */
    .cert-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 68%;
    }
 
    /* Logo */
    .logo-box {
      background: #2a2118;
      border: 2px solid #c8a846;
      border-radius: 4px;
      width: 76px;
      height: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 5px;
      flex-shrink: 0;
    }
    .logo-box img {
      width: 62px;
      height: 62px;
      object-fit: contain;
    }
    .logo-ring {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 2px solid #c8a846;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    .logo-fallback-flame { font-size: 11px; color: #d4af37; }
    .logo-fallback-text {
      font-family: 'Cinzel', serif;
      font-size: 14px;
      font-weight: 700;
      color: #d4af37;
      letter-spacing: 2px;
      line-height: 1;
    }
    .institute-label {
      font-family: 'Cinzel', serif;
      font-size: 8.5px;
      letter-spacing: 3px;
      color: #d4af37;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
 
    .cert-heading {
      font-family: 'Cinzel', serif;
      font-size: 38px;
      font-weight: 700;
      color: #d4af37;
      letter-spacing: 10px;
      line-height: 1;
      margin-bottom: 2px;
    }
    .cert-subheading {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      font-weight: 400;
      color: #b89030;
      letter-spacing: 6px;
      margin-bottom: 9px;
      text-transform: uppercase;
    }
 
    .divider {
      width: 80%;
      height: 1px;
      background: linear-gradient(to right, transparent, #c8a846, transparent);
      margin-bottom: 8px;
    }
 
    .presented-to {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      letter-spacing: 3px;
      color: #aaa;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
 
    .recipient-name {
      font-family: 'EB Garamond', serif;
      font-size: 30px;
      font-style: italic;
      color: #f5e07a;
      font-weight: 500;
      margin-bottom: 7px;
      border-bottom: 1px solid #888;
      padding-bottom: 5px;
      min-width: 280px;
    }
 
    .description {
      font-family: 'EB Garamond', serif;
      font-size: 13px;
      color: #e0e0e0;
      line-height: 1.6;
      max-width: 92%;
      margin-bottom: 12px;
    }
 
    .bottom-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      width: 100%;
      margin-top: 2px;
    }
 
    .cert-details {
      font-family: 'EB Garamond', serif;
      font-size: 11px;
      color: #999;
      font-style: italic;
      text-align: left;
      line-height: 1.6;
    }
    .cert-details b { color: #d4af37; font-style: normal; }
 
    .signature-section {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .signature-line {
      width: 150px;
      height: 1px;
      background: linear-gradient(to right, transparent, #888, transparent);
      margin-bottom: 5px;
    }
    .signature-name {
      font-family: 'EB Garamond', serif;
      font-size: 13px;
      font-style: italic;
      color: #f0f0f0;
    }
    .signature-title {
      font-family: 'Cinzel', serif;
      font-size: 9px;
      color: #d4af37;
      letter-spacing: 2px;
    }
    .signature-company {
      font-family: 'EB Garamond', serif;
      font-size: 10px;
      color: #aaa;
    }
 
    .seal-block {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .seal-svg { width: 72px; }
    .verify-text {
      font-family: 'EB Garamond', serif;
      font-size: 10px;
      font-style: italic;
      color: #aaa;
      margin-top: 2px;
      text-align: center;
    }
    .verify-text b { color: #d4af37; font-style: normal; }
  </style>
</head>
<body>
<div class="certificate">
 
  <!-- Top-left corner -->
  <svg class="corner corner-tl" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,0 L180,0 Q220,0 220,40 L220,60 Q180,20 120,20 L0,20 Z" fill="#b8952a" opacity="0.9"/>
    <path d="M0,0 L160,0 Q200,0 200,40 L200,55 Q165,18 105,18 L0,18 Z" fill="#d4af37" opacity="0.7"/>
    <path d="M0,0 L0,180 Q0,220 40,220 L60,220 Q20,180 20,120 L20,0 Z" fill="#b8952a" opacity="0.9"/>
    <path d="M0,0 L0,160 Q0,200 40,200 L55,200 Q18,165 18,105 L18,0 Z" fill="#d4af37" opacity="0.7"/>
    <circle cx="195" cy="195" r="30" stroke="#c8a846" stroke-width="1" fill="none" opacity="0.4"/>
    <circle cx="195" cy="195" r="20" stroke="#c8a846" stroke-width="0.5" fill="none" opacity="0.3"/>
  </svg>
 
  <!-- Top-right corner -->
  <svg class="corner corner-tr" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M220,0 L40,0 Q0,0 0,40 L0,60 Q40,20 100,20 L220,20 Z" fill="#b8952a" opacity="0.9"/>
    <path d="M220,0 L60,0 Q20,0 20,40 L20,55 Q55,18 115,18 L220,18 Z" fill="#d4af37" opacity="0.7"/>
    <path d="M220,0 L220,180 Q220,220 180,220 L160,220 Q200,180 200,120 L200,0 Z" fill="#b8952a" opacity="0.9"/>
    <path d="M220,0 L220,160 Q220,200 180,200 L165,200 Q202,165 202,105 L202,0 Z" fill="#d4af37" opacity="0.7"/>
    <rect x="30" y="30" width="80" height="80" rx="4" stroke="#c8a846" stroke-width="0.8" fill="none" opacity="0.5"/>
    <rect x="40" y="40" width="60" height="60" rx="4" stroke="#c8a846" stroke-width="0.5" fill="none" opacity="0.3"/>
  </svg>
 
  <!-- Bottom-left corner -->
  <svg class="corner corner-bl" viewBox="0 0 180 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,130 L160,130 Q180,130 180,110 L180,96 Q158,118 110,118 L0,118 Z" fill="#b8952a" opacity="0.9"/>
    <path d="M0,130 L0,20 Q0,0 20,0 L34,0 Q12,22 12,70 L12,130 Z" fill="#b8952a" opacity="0.9"/>
  </svg>
 
  <!-- Bottom-right corner -->
  <svg class="corner corner-br" viewBox="0 0 180 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M180,130 L20,130 Q0,130 0,110 L0,96 Q22,118 70,118 L180,118 Z" fill="#b8952a" opacity="0.9"/>
    <path d="M180,130 L180,20 Q180,0 160,0 L146,0 Q168,22 168,70 L168,130 Z" fill="#b8952a" opacity="0.9"/>
  </svg>
 
  <!-- ── CONTENT ── -->
  <div class="cert-content">
 
    <div class="logo-box">
      <img src="/logo.png" alt="BBMI Logo"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="logo-ring" style="display:none;">
        <div class="logo-fallback-flame">🔥</div>
        <div class="logo-fallback-text">BBMI</div>
      </div>
    </div>
    <div class="institute-label">Makeup Institute</div>
 
    <div class="cert-heading">CERTIFICATE</div>
    <div class="cert-subheading">Of Completion</div>
 
    <div class="divider"></div>
 
    <div class="presented-to">This Certificate is Proudly Presented To</div>
 
    <div class="recipient-name">${data.userName}</div>
 
    <div class="description">
      In recognition of successfully completing the <b style="color:#f5e07a;">${data.trainingTitle}</b> Course,<br>
      demonstrating mastery of essential beauty techniques, client care, and creative application skills.<br>
      This certificate is awarded on ${data.completionDate} as a testament to ${data.userName}'s dedication,<br>
      artistry, and commitment to excellence in the field of professional makeup.
    </div>
 
    <div class="bottom-row">
 
      <div class="cert-details">
        Certificate No: <b>${data.certificateNumber}</b><br>
        Verification Code: <b>${data.verificationCode}</b>
      </div>
 
      <div class="signature-section">
        <div class="signature-line"></div>
        <div class="signature-name">Ms Betelhem</div>
        <div class="signature-title">CEO, BBMI</div>
        <div class="signature-company">Brushed by Betty Makeup Institute</div>
      </div>
 
      <div class="seal-block">
        <svg class="seal-svg" viewBox="0 0 110 130" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sg" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stop-color="#f5e07a"/>
              <stop offset="40%" stop-color="#d4af37"/>
              <stop offset="100%" stop-color="#8a6a00"/>
            </radialGradient>
            <radialGradient id="si" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stop-color="#ffe680"/>
              <stop offset="60%" stop-color="#c8960c"/>
              <stop offset="100%" stop-color="#7a5200"/>
            </radialGradient>
          </defs>
          <g transform="translate(55,52)">
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(22.5)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(45)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(67.5)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(90)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(112.5)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(135)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(157.5)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(180)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(202.5)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(225)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(247.5)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(270)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(292.5)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(315)"/>
            <polygon points="0,-44 4,-32 -4,-32" fill="url(#sg)" transform="rotate(337.5)"/>
            <circle r="36" fill="url(#sg)"/>
            <circle r="30" fill="url(#si)"/>
            <circle r="26" fill="none" stroke="#f0d060" stroke-width="0.8" opacity="0.6"/>
            <circle r="22" fill="none" stroke="#f0d060" stroke-width="0.5" opacity="0.4"/>
          </g>
          <polygon points="30,104 44,88 44,130 30,118" fill="#b8952a"/>
          <polygon points="44,88 44,130 55,130 55,88" fill="#d4af37"/>
          <polygon points="80,104 66,88 66,130 80,118" fill="#b8952a"/>
          <polygon points="66,88 66,130 55,130 55,88" fill="#c8a028"/>
        </svg>
        <div class="verify-text">Verify at: <b>brushedbybetty.com</b><br>${data.completionDate}</div>
      </div>
 
    </div>
  </div>
 
</div>
</body>
</html>
`
 }