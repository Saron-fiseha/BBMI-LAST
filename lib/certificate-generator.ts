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
        <style>
            @page {
                size: A4 landscape;
                margin: 0;
            }
            body {
                margin: 0;
                padding: 20px;
                font-family: 'Times New Roman', serif;
                background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
                width: 100%;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .certificate {
                width: 800px;
                height: 600px;
                border: 8px solid #B8860B;
                border-radius: 20px;
                padding: 40px;
                background: white;
                position: relative;
                box-shadow: 0 0 30px rgba(0,0,0,0.1);
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
            }
            .logo {
                width: 80px;
                height: 80px;
                border: 3px solid #B8860B;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: #B8860B;
                font-size: 12px;
            }
            .institute-name {
                font-size: 14px;
                color: #333;
                margin-left: 20px;
            }
            .seal {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: radial-gradient(circle, #FFD700 0%, #B8860B 100%);
                border: 4px solid #B8860B;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #B8860B;
                font-weight: bold;
                font-size: 10px;
            }
            .title {
                text-align: center;
                margin: 40px 0;
            }
            .title h1 {
                font-size: 48px;
                color: #2D5490;
                margin: 0;
                font-weight: bold;
            }
            .title h2 {
                font-size: 20px;
                color: #2D5490;
                margin: 5px 0 0 0;
                font-weight: normal;
            }
            .presented-to {
                text-align: center;
                font-size: 16px;
                color: #333;
                margin: 30px 0 10px 0;
            }
            .recipient-name {
                text-align: center;
                font-size: 36px;
                color: #B8860B;
                font-style: italic;
                font-weight: bold;
                margin: 20px 0;
                border-bottom: 2px solid #B8860B;
                padding-bottom: 10px;
                display: inline-block;
                width: 100%;
            }
            .description {
                text-align: center;
                font-size: 14px;
                color: #333;
                line-height: 1.6;
                margin: 30px 0;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            .signature-section {
                text-align: center;
                margin-top: 50px;
            }
            .signature-line {
                width: 200px;
                height: 1px;
                background: #333;
                margin: 0 auto 10px auto;
            }
            .signature-name {
                font-size: 16px;
                font-style: italic;
                color: #333;
                margin-bottom: 5px;
            }
            .signature-title {
                font-size: 14px;
                font-weight: bold;
                color: #2D5490;
                margin-bottom: 5px;
            }
            .signature-company {
                font-size: 12px;
                color: #666;
            }
            .certificate-details {
                position: absolute;
                bottom: 20px;
                left: 40px;
                right: 40px;
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                color: #888;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="header">
                <div style="display: flex; align-items: center;">
                    <div class="logo">
                        BBMI<br>LOGO
                    </div>
                    <div class="institute-name">
                        <div>BRUSHED BY</div>
                        <div>BETTY MAKEUP</div>
                        <div>INSTITUTE</div>
                    </div>
                </div>
                <div class="seal">
                    <div>CERTIFIED</div>
                    <div>COMPLETION</div>
                </div>
            </div>
            
            <div class="title">
                <h1>CERTIFICATE</h1>
                <h2>OF COMPLETION</h2>
            </div>
            
            <div class="presented-to">
                THIS CERTIFICATE IS PRESENTED TO
            </div>
            
            <div class="recipient-name">
                ${data.userName}
            </div>
            
            <div class="description">
                In recognition of exceptional skill in ${data.trainingTitle.toLowerCase()}, including<br>
                professional techniques, client consultation, and personalized beauty enhancement.<br>
                Proudly awarded by BBMI on ${data.completionDate}.
            </div>
            
            <div class="signature-section">
                <div class="signature-line"></div>
                <div class="signature-name">Ms Betelhem</div>
                <div class="signature-title">MS BETELHEM</div>
                <div class="signature-company">CEO, BBMI</div>
            </div>
            
            <div class="certificate-details">
                <div>
                    Certificate Number: ${data.certificateNumber}<br>
                    Verification Code: ${data.verificationCode}
                </div>
                <div>
                    Verify at: bbmi-institute.com/verify<br>
                    Issue Date: ${data.completionDate}
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}
