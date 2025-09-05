// C:\Users\Hp\Documents\BBMI-LMS\app\api\chapa\checkout\route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log(">> /api/chapa/checkout: Request received.");

  try {
    const body = await req.json();
    console.log(">> /api/chapa/checkout: Request body:", body);
    const { amount, currency, email, first_name, last_name, courseId, userId } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0 || !currency || !email || !first_name || !last_name || !courseId || !userId) {
      console.error(">> /api/chapa/checkout: Missing or invalid required fields in request body.");
      return NextResponse.json(
        { error: "Missing or invalid required fields (amount, currency, email, first_name, last_name, courseId, userId)" },
        { status: 400 }
      );
    }

    const txRef = `tx-${Date.now()}`;
    console.log(">> /api/chapa/checkout: Generated txRef:", txRef);

    // Construct callback_url robustly
    const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/chapa/verify`;
    const callbackUrlObject = new URL(baseUrl);
    callbackUrlObject.searchParams.append('tx_ref', txRef);
    callbackUrlObject.searchParams.append('courseId', courseId.toString());
    callbackUrlObject.searchParams.append('userId', userId.toString());
    const finalCallbackUrl = callbackUrlObject.toString();
    console.log(">> /api/chapa/checkout: Constructed callback_url:", finalCallbackUrl);

    // --- IMPORTANT FIX HERE: Add tx_ref to return_url ---
    const returnUrlObject = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}/payment`);
    returnUrlObject.searchParams.append('status', 'completed');
    returnUrlObject.searchParams.append('tx_ref', txRef); // <-- ADD tx_ref here
    const finalReturnUrl = returnUrlObject.toString();
    console.log(">> /api/chapa/checkout: Constructed return_url:", finalReturnUrl);
    // --- END IMPORTANT FIX ---


    const chapaRequestBody = {
      amount: amount,
      currency: currency,
      email: email,
      first_name: first_name,
      last_name: last_name,
      tx_ref: txRef,
      callback_url: finalCallbackUrl,
      return_url: finalReturnUrl, // Use the new return URL
      customization: {
        title: "Course Payment",
        description: `Payment for course ${courseId}`,
      },
    };
    console.log(">> /api/chapa/checkout: Chapa request body:", JSON.stringify(chapaRequestBody, null, 2));

    const chapaRes = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chapaRequestBody),
    });
    console.log(">> /api/chapa/checkout: Chapa API call completed.");

    const data = await chapaRes.json();
    console.log("Chapa response (after tx_ref fix):", data);

    if (!chapaRes.ok || data.status === "failed" || !data.data?.checkout_url) {
      console.error(">> /api/chapa/checkout: Chapa API call failed or returned error.");
      return NextResponse.json(
        { error: data.message || data.status || data.error || "Failed to initialize Chapa checkout." },
        { status: 400 }
      );
    }

    console.log(">> /api/chapa/checkout: Chapa checkout URL obtained.");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(">> /api/chapa/checkout: Chapa API error caught in route handler:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while processing your payment." },
      { status: 500 }
    );
  }
}