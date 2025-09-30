// lib/certificate-queries.ts
import { sql } from "@/lib/db";
import { CertificateData } from "@/lib/certificate-generator"; // Assuming CertificateData is exported from here

/**
 * Helper function to map a database query result row to the CertificateData interface.
 * It also formats the completion date to a human-readable string.
 *
 * @param dbResult - The raw database row object.
 * @returns CertificateData object or null if the input is null/undefined.
 */
function mapCertificateResultToCertificateData(dbResult: any): CertificateData | null {
  if (!dbResult) {
    return null;
  }

  // Format the date string as used in the generateCertificateHTML
  const formattedCompletionDate = dbResult.completion_date
    ? new Date(dbResult.completion_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return {
    userName: dbResult.user_name,
    trainingTitle: dbResult.training_name,
    completionDate: formattedCompletionDate,
    certificateNumber: dbResult.certificate_code, // Maps to 'certificate_code' in your DB
    verificationCode: dbResult.verification_code,
    instructorName: dbResult.instructor_name,
    trainingDescription: dbResult.training_description || undefined, // 'description' from 'trainings' table
  };
}

/**
 * Fetches a single certificate's detailed information using its verification code.
 * Joins with the 'trainings' table to get the training description.
 *
 * @param verificationCode - The unique verification code of the certificate.
 * @returns A Promise that resolves to CertificateData or null if not found.
 */
export async function getCertificateByVerificationCode(verificationCode: string): Promise<CertificateData | null> {
  try {
    const result = await sql`
      SELECT
        c.id,
        c.user_id,
        c.training_id,
        c.issue_date,
        c.completion_date,
        c.certificate_code,
        c.verification_code,
        c.instructor_name,
        c.training_name,
        c.user_name,
        t.description AS training_description, -- Alias training description from 'trainings' table
        t.duration AS training_duration        -- Potentially useful for other parts, not strictly in CertificateData
      FROM certificates c
      LEFT JOIN trainings t ON c.training_id = t.id -- Join to get training description
      WHERE c.verification_code = ${verificationCode}
      LIMIT 1
    `;

    if (result.length === 0) {
      console.log(`No certificate found for verification code: ${verificationCode}`);
      return null;
    }

    return mapCertificateResultToCertificateData(result[0]);
  } catch (error) {
    console.error("Error fetching certificate by verification code:", error);
    // Depending on your error handling strategy, you might re-throw or return null
    throw error;
  }
}

/**
 * Fetches a single certificate's detailed information using its database ID.
 * Joins with the 'trainings' table to get the training description.
 *
 * @param id - The unique ID of the certificate in the database.
 * @returns A Promise that resolves to CertificateData or null if not found.
 */
export async function getCertificateById(id: number): Promise<CertificateData | null> {
  try {
    const result = await sql`
      SELECT
        c.id,
        c.user_id,
        c.training_id,
        c.issue_date,
        c.completion_date,
        c.certificate_code,
        c.verification_code,
        c.instructor_name,
        c.training_name,
        c.user_name,
        t.description AS training_description, -- Alias training description from 'trainings' table
        t.duration AS training_duration
      FROM certificates c
      LEFT JOIN trainings t ON c.training_id = t.id -- Join to get training description
      WHERE c.id = ${id}
      LIMIT 1
    `;

    if (result.length === 0) {
      console.log(`No certificate found for ID: ${id}`);
      return null;
    }

    return mapCertificateResultToCertificateData(result[0]);
  } catch (error) {
    console.error("Error fetching certificate by ID:", error);
    // Depending on your error handling strategy, you might re-throw or return null
    throw error;
  }
}