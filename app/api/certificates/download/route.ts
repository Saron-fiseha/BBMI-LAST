// // C:\Users\Hp\Documents\BBMI-LMS\app\api\certificates\download\route.ts
// import { NextRequest, NextResponse } from "next/server";
// import puppeteer from 'puppeteer-core';
// import chrome from '@sparticuz/chromium'; // Required for Vercel/serverless deployments
// import { generateCertificateHTML, CertificateData } from "@/lib/certificate-generator";
// export const dynamic = "force-dynamic"

// export async function POST(req: NextRequest) {
//   try {
//     const {
//       certificateId,
//       studentName,
//       courseName,
//       instructorName,
//       certificateIssuedAt,
//       certificateNumber,
//       verificationCode,
//       grade,
//       duration,
//       skills,
//       trainingDescription,
//     } = await req.json();

//     if (!verificationCode || !studentName || !courseName || !certificateIssuedAt || !certificateNumber) {
//       return NextResponse.json({ error: "Missing essential certificate data for PDF generation." }, { status: 400 });
//     }

//     const baseUrl = req.nextUrl.origin;
//     const logoUrl = `${baseUrl}/logo.png`;

//     const certificateData: CertificateData = {
//       userName: studentName,
//       trainingTitle: courseName,
//       completionDate: certificateIssuedAt,
//       certificateNumber,
//       verificationCode,
//       instructorName: instructorName || "Ms Betelhem",
//       trainingDescription,
//     };

//     // Use the single source of truth for certificate design
//     const certificateHtml = generateCertificateHTML(certificateData);

//     // 3. Configure and launch Puppeteer based on environment
//     let browser;
//     if (process.env.NODE_ENV === 'development') {
//       console.log("Launching Puppeteer in Development Mode...");
//       // For local development, puppeteer-core will try to find a system Chrome/Chromium.
//       // If you've installed the full 'puppeteer' package locally, it will use its downloaded Chromium.
//       // If it still fails, you might need to manually specify executablePath here for your local setup
//       // e.g., executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
//       // or install 'puppeteer' package instead of 'puppeteer-core' for simpler local setup.
//       browser = await puppeteer.launch({
//         headless: true, // Run in headless mode (no browser window opens)
//         args: ['--no-sandbox', '--disable-setuid-sandbox'], // Recommended args for robustness
//         // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
//         executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
//       });
//     } else {
//       console.log("Launching Puppeteer in Production Mode (Serverless)...");
//       // For production (e.g., Vercel), use @sparticuz/chromium
//       browser = await puppeteer.launch({
//         args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
//         executablePath: await chrome.executablePath(),
//         headless: true,
//       });
//     }

//     const page = await browser.newPage();
//     await page.setContent(certificateHtml, {
//       waitUntil: ['domcontentloaded', 'networkidle0'],
//     });

//     // 4. Generate PDF
//     const pdfBuffer = await page.pdf({
//       format: 'A4',
//       landscape: true,
//       printBackground: true,
//       margin: {
//         top: '0mm',
//         right: '0mm',
//         bottom: '0mm',
//         left: '0mm',
//       },
//     });

//     await browser.close();

//     // 5. Send PDF as a response
//     const headers = new Headers();
//     headers.set('Content-Type', 'application/pdf');
//     headers.set('Content-Disposition', `attachment; filename="BBMI-Certificate-${certificateNumber}.pdf"`);

//      return new NextResponse(Buffer.from(pdfBuffer), { headers });

//   } catch (error) {
//     console.error("Error generating or downloading PDF:", error);
//     return NextResponse.json({ error: "Failed to generate PDF certificate." }, { status: 500 });
//   }
// }
// C:\Users\Hp\Documents\BBMI-LMS\app\api\certificates\download\route.ts
import { NextRequest, NextResponse } from "next/server";
import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium'; // Required for Vercel/serverless deployments
import { generateCertificateHTML, CertificateData } from "@/lib/certificate-generator";
export const dynamic = "force-dynamic"

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

    const certificateData: CertificateData = {
      userName: studentName,
      trainingTitle: courseName,
      completionDate: certificateIssuedAt,
      certificateNumber,
      verificationCode,
      instructorName: instructorName || "Ms Betelhem",
      trainingDescription,
    };

    // Use the single source of truth for certificate design.
    // Pass the absolute logoUrl: Puppeteer's page.setContent() below loads
    // this HTML as a blank in-memory page (not a real page at our domain),
    // so a relative "/logo.png" path has no origin to resolve against and
    // silently fails, falling back to the placeholder logo. This is what
    // was causing the logo to look different specifically in downloaded
    // PDFs.
    const certificateHtml = generateCertificateHTML(certificateData, { logoUrl });

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
        // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
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