"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token was provided.");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified!");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            {status === "loading" && (
              <Loader2 className="h-12 w-12 text-custom-copper animate-spin mx-auto mb-2" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
            )}
            {status === "error" && (
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            )}

            <CardTitle className="text-2xl font-bold">
              {status === "loading" && "Verifying your email..."}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            {status === "success" && (
              <Button
                asChild
                className="w-full bg-custom-copper hover:bg-custom-copper/90 text-white font-bold"
              >
                <Link href="/login">Go to Login</Link>
              </Button>
            )}
            {status === "error" && (
              <div className="space-y-3">
                <Button
                  asChild
                  className="w-full bg-custom-copper hover:bg-custom-copper/90 text-white font-bold"
                >
                  <Link href="/login">Go to Login</Link>
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  You can request a new verification link from the login page.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-custom-copper" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}