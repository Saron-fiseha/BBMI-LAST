// app/verify/[verification_code]/page.tsx
// (No "use client" as it's a Server Component)

import { notFound } from "next/navigation";
import { getCertificateByVerificationCode } from "@/lib/certificate-queries";
import {
  generateCertificateHTML,
  CertificateData,
} from "@/lib/certificate-generator";

interface VerifyPageProps {
  params: {
    verification_code: string;
  };
}

export default async function VerifyCertificatePage({
  params,
}: VerifyPageProps) {
  const { verification_code } = params;

  if (!verification_code) {
    notFound();
  }

  const certificateData: CertificateData | null =
    await getCertificateByVerificationCode(verification_code);

  if (!certificateData) {
    notFound();
  }

  // htmlContent now contains the <style> block and the <div class="certificate-wrapper">...</div>
  const htmlContent = generateCertificateHTML(certificateData);

  return (
    <div
      className="certificate-host-container min-h-screen flex items-center justify-center bg-gray-100 p-4 overflow-auto"
      // Added max-w-full and max-h-full to ensure the host container doesn't force overflow
      // but rather allows the internal content to scale itself.
      style={{ overflow: "auto", maxWidth: "100vw", maxHeight: "100vh" }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    >
      {/* The HTML content now contains a .certificate-wrapper which holds the actual .certificate */}
      {/* The styles for the certificate are embedded within htmlContent. */}
    </div>
  );
}
