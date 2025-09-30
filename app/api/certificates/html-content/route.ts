// C:\Users\Hp\Documents\BBMI-LMS\app\api\certificates\html-content\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCertificateByVerificationCode } from '@/lib/certificate-queries';
import { generateCertificateHTML } from '@/lib/certificate-generator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const verificationCode = searchParams.get('verificationCode');

    if (!verificationCode) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    const certificateData = await getCertificateByVerificationCode(verificationCode);

    if (!certificateData) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Generate the HTML content. This function now returns the <style> and <div class="certificate-wrapper">
    const htmlContent = generateCertificateHTML(certificateData);

    // Return the HTML content with the correct Content-Type header
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Error fetching certificate HTML:', error);
    return NextResponse.json({ error: 'Failed to retrieve certificate HTML' }, { status: 500 });
  }
}