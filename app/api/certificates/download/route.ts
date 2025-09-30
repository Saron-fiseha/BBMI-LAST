// C:\Users\Hp\Documents\BBMI-LMS\app\api\certificates\download\route.ts
import { NextRequest, NextResponse } from "next/server";
import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium'; // Required for Vercel/serverless deployments

export async function POST(req: NextRequest) {
  try {
    const {
      certificateId,
      studentName,
      courseName,
      instructorName,
      certificateIssuedAt,
      certificateNumber,
      verificationCode,
      grade,
      duration,
      skills,
      trainingDescription,
    } = await req.json();

    if (!verificationCode || !studentName || !courseName || !certificateIssuedAt || !certificateNumber) {
      return NextResponse.json({ error: "Missing essential certificate data for PDF generation." }, { status: 400 });
    }

    const baseUrl = req.nextUrl.origin;
    const logoUrl = `${baseUrl}/logo.png`;

    const certificateHtml = `
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
            padding: 0;
            font-family: 'Georgia', serif;
            background: radial-gradient(circle at center, #ffffff 0%, #f4f4f4 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* A4 landscape exact size (px at 96dpi) */
          .certificate {
            width: 1123px; /* Corresponds to A4 landscape width at 96dpi */
            height: 794px; /* Corresponds to A4 landscape height at 96dpi */
            background: #f7ebd5;
            border: 12px double #B8860B;
            border-radius: 12px;
            padding: 40px;
            position: relative;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.2);
            box-sizing: border-box;
            overflow: hidden; /* Ensure nothing spills out */
          }

          .certificate::before,
          .certificate::after {
            content: "";
            position: absolute;
            width: 60px;
            height: 60px;
            border: 5px solid #B8860B;
          }
          .certificate::before {
            top: 20px;
            left: 20px;
            border-right: none;
            border-bottom: none;
          }
          .certificate::after {
            bottom: 20px;
            right: 20px;
            border-left: none;
            border-top: none;
          }

          .certificate-header {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            margin-bottom: 20px;
            padding-left: 20px;
          }

          .logo {
            max-width: 80px;
            margin-right: 12px;
          }

          .logo img {
            width: 100%;
            height: auto;
            display: block;
          }

          .institute-name {
            font-size: 20px;
            color: #2D2D2D;
            font-weight: bold;
            letter-spacing: 1px;
          }

          .title {
            text-align: center;
            margin: 70px 0 10px 0;
          }
          .title h1 {
            font-size: 48px;
            color: #2D5490;
            margin: 0;
            font-weight: bold;
            letter-spacing: 5px;
          }
          .title h2 {
            font-size: 20px;
            color: #555;
            margin: 5px 0 0 0;
            font-weight: normal;
            letter-spacing: 3px;
          }

          .presented-to {
            text-align: center;
            font-size: 16px;
            color: #333;
            margin: 20px 0 5px 0;
            letter-spacing: 2px;
          }

          .recipient-name {
            display: inline-block;
            text-align: center;
            font-size: 36px;
            color: #B8860B;
            font-style: italic;
            font-weight: bold;
            margin: 10px auto 20px auto;
            padding-bottom: 6px;
            border-bottom: 3px solid #B8860B;
          }
          .recipient-wrapper {
            text-align: center;
          }

          .description {
            text-align: center;
            font-size: 14px;
            color: #444;
            line-height: 1.6;
            margin: 20px auto;
            max-width: 700px;
          }

          .signature-section {
            text-align: center;
            margin-top: 30px;
          }
          .signature-line {
            width: 200px;
            height: 2px;
            background: #333;
            margin: 0 auto 10px auto;
          }
          .signature-name {
            font-size: 16px;
            font-style: italic;
            color: #333;
          }
          .signature-title {
            font-size: 14px;
            font-weight: bold;
            color: #2D5490;
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
            font-size: 11px;
            color: #555;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="certificate-header">
            <div class="logo">
              <img src="${logoUrl}" alt="BBMI Logo">
            </div>
            <div class="institute-name">
              <div>BRUSHED BY</div>
              <div>BETTY MAKEUP</div>
              <div>INSTITUTE</div>
            </div>
          </div>
          
          <div class="title">
            <h1>CERTIFICATE</h1>
            <h2>OF COMPLETION</h2>
          </div>
          
          <div class="presented-to">This Certificate is Proudly Presented To</div>
          <div class="recipient-wrapper">
            <div class="recipient-name">${studentName}</div>
          </div>
          
          <div class="description">
            In recognition of successfully completing the <b>${courseName}</b> Course,<br> 
            demonstrating mastery of essential beauty techniques, client care, and creative application skills.<br>
            This certificate is awarded on ${certificateIssuedAt} as a testament to ${studentName}'s dedication,<br>
            artistry, and commitment to excellence in the field of professional makeup.
          </div>
          
          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-name">Ms Betelhem</div>
            <div class="signature-title">CEO, BBMI</div>
            <div class="signature-company">Brushed by Betty Makeup Institute</div>
          </div>
          
          <div class="certificate-details">
            <div>
              Certificate No: ${certificateNumber}<br>
              Verification Code: ${verificationCode}
            </div>
            <div>
              Verify at: <b>www.brushedbybetty.com</b><br>
              Date: ${certificateIssuedAt}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // 3. Configure and launch Puppeteer based on environment
    let browser;
    if (process.env.NODE_ENV === 'development') {
      console.log("Launching Puppeteer in Development Mode...");
      // For local development, puppeteer-core will try to find a system Chrome/Chromium.
      // If you've installed the full 'puppeteer' package locally, it will use its downloaded Chromium.
      // If it still fails, you might need to manually specify executablePath here for your local setup
      // e.g., executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      // or install 'puppeteer' package instead of 'puppeteer-core' for simpler local setup.
      browser = await puppeteer.launch({
        headless: true, // Run in headless mode (no browser window opens)
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Recommended args for robustness
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      });
    } else {
      console.log("Launching Puppeteer in Production Mode (Serverless)...");
      // For production (e.g., Vercel), use @sparticuz/chromium
      browser = await puppeteer.launch({
        args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
        executablePath: await chrome.executablePath(),
        headless: true,
      });
    }

    const page = await browser.newPage();
    await page.setContent(certificateHtml, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
    });

    // 4. Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });

    await browser.close();

    // 5. Send PDF as a response
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="BBMI-Certificate-${certificateNumber}.pdf"`);

     return new NextResponse(Buffer.from(pdfBuffer), { headers });

  } catch (error) {
    console.error("Error generating or downloading PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF certificate." }, { status: 500 });
  }
}