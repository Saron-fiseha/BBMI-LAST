// C:\Users\Hp\Documents\BBMI-LMS\app\courses\[id]\payment\page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Define the Training interface here for clarity and type safety
interface Training {
  id: string;
  name: string;
  description: string;
  price: number;
}

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const rawSearchParams = useSearchParams();
  const [training, setTraining] = useState<Training | null>(null);
  const [trainingLoading, setTrainingLoading] = useState(true);

  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const verifyAttempted = useRef(false);

  // Effect to fetch training details
  useEffect(() => {
    const fetchTrainingDetails = async () => {
      try {
        setTrainingLoading(true);
        const res = await fetch(`/api/courses/${id}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(
            "Failed to fetch training details: " + res.statusText
          );
        }
        const data = await res.json();
        if (data && data.training) {
          setTraining(data.training);
        } else {
          console.error("API response missing 'training' data:", data);
          setTraining(null);
        }
      } catch (err: any) {
        console.error("Error fetching training details:", err);
        setTraining(null);
      } finally {
        setTrainingLoading(false);
      }
    };
    fetchTrainingDetails();
  }, [id]);

  // Effect to handle payment status from URL query parameters AND trigger verification
  useEffect(() => {
    const rawQueryString = window.location.search;
    const correctedQueryString = rawQueryString.replace(/&amp;/g, "&");
    const searchParams = new URLSearchParams(correctedQueryString);

    const statusParam = searchParams.get("status");
    const txRefParam = searchParams.get("tx_ref");

    // Only proceed if payment is marked completed, tx_ref is present, user/training is loaded, and verification hasn't been attempted
    if (
      statusParam === "completed" &&
      txRefParam &&
      user?.id &&
      training?.id &&
      !verifyAttempted.current
    ) {
      setPaymentStatus("processing"); // Show processing state to user
      verifyAttempted.current = true; // Mark verification as attempted to prevent re-runs

      const finalizePayment = async () => {
        try {
          const verifyRes = await fetch(
            `/api/chapa/verify?tx_ref=${txRefParam}&courseId=${training.id}&userId=${user.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const verifyData = await verifyRes.json();
          console.log("Client-side verify API response:", verifyData);

          if (verifyData.success) {
            toast({
              title: "Payment Successful! 🎉",
              description: "Your enrollment has been confirmed.",
            });
            console.log(
              "Attempting redirect to:",
              `/courses/${training.id}?enrolled=true`
            );
            router.replace(`/courses/${training.id}?enrolled=true`); // This should redirect
          } else {
            toast({
              title: "Payment Failed",
              description:
                verifyData.message || "Could not confirm enrollment.",
              variant: "destructive",
            });
            router.replace(`/courses/${training.id}?paymentFailed=true`);
          }
        } catch (error) {
          console.error("Error during client-side verification:", error);
          toast({
            title: "Payment Error",
            description: "An unexpected error occurred during verification.",
            variant: "destructive",
          });
          router.replace(
            `/courses/${training.id}?paymentError=client_verify_failed`
          );
        } finally {
          // Clean up URL parameters after verification attempt, regardless of success/failure
          const newSearchParams = new URLSearchParams(
            rawSearchParams.toString()
          ); // Use rawSearchParams for consistency
          newSearchParams.delete("status");
          newSearchParams.delete("tx_ref");
          // Only replace if parameters were actually present in the original URL
          if (rawSearchParams.has("status") || rawSearchParams.has("tx_ref")) {
            router.replace(
              `${window.location.pathname}?${newSearchParams.toString()}`,
              { scroll: false }
            );
          }
        }
      };

      // Only run finalizePayment if authentication and training data are fully loaded
      if (!authLoading && !trainingLoading) {
        finalizePayment();
      }
    } else if (statusParam === "completed" && !txRefParam) {
      // Fallback for unexpected missing tx_ref, should be less common now
      toast({
        title: "Payment Error",
        description:
          "Missing transaction reference for verification. (No tx_ref in URL after cleaning)",
        variant: "destructive",
      });
      router.replace(
        `/courses/${training?.id || ""}?paymentError=missing_tx_ref`
      );
      const newSearchParams = new URLSearchParams(rawSearchParams.toString());
      newSearchParams.delete("status");
      router.replace(
        `${window.location.pathname}?${newSearchParams.toString()}`,
        { scroll: false }
      );
    } else {
      setPaymentStatus(null); // Clear status if not present or not 'completed'
    }
  }, [
    rawSearchParams,
    router,
    user,
    training,
    authLoading,
    trainingLoading,
    toast,
  ]);

  const handlePayNow = async () => {
    if (authLoading) {
      alert("Loading user session. Please try again in a moment.");
      return;
    }
    if (
      !isAuthenticated ||
      !user ||
      !user.email ||
      !user.full_name ||
      !user.id
    ) {
      alert(
        "You must be logged in with complete profile information to make a payment."
      );
      router.push("/login");
      return;
    }
    if (!training) {
      alert("Training details are not loaded. Cannot proceed with payment.");
      return;
    }

    try {
      const amountToSend = parseFloat(training.price.toString());
      if (isNaN(amountToSend) || amountToSend <= 0) {
        alert("Chapa Error: Invalid amount for payment.");
        return;
      }

      const userEmail = user.email;
      const fullNameParts = user.full_name.split(" ");
      const userFirstName = fullNameParts[0] || "Guest";
      const userLastName = fullNameParts.slice(1).join(" ") || "User";

      const res = await fetch("/api/chapa/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountToSend,
          currency: "ETB",
          email: userEmail,
          first_name: userFirstName,
          last_name: userLastName,
          courseId: training.id,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (data.data?.checkout_url) {
        window.location.href = data.data.checkout_url;
      } else {
        alert(
          `Chapa Error: ${
            typeof data.error === "object"
              ? JSON.stringify(data.error, null, 2)
              : data.error || "Unknown error"
          }`
        );
        console.error("Chapa Error Details:", data);
      }
    } catch (err) {
      alert("Something went wrong. Check console for details.");
      console.error(err);
    }
  };

  // --- Conditional Rendering Logic ---

  if (trainingLoading || authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading training details and user session...</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!training) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p>Training not found or failed to load.</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!isAuthenticated || !user || !user.email || !user.full_name) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <SiteHeader />
        <main className="flex-1 py-12">
          <div className="container max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">
              Payment for {training.name}
            </h1>
            <p className="text-lg text-red-500 mb-6">
              Please log in with complete profile information to proceed with
              the payment.
            </p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (paymentStatus === "processing") {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <SiteHeader />
        <main className="flex-1 py-12">
          <div className="container max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-green-600 mb-4">
              Payment Confirmed!
            </h1>
            <p className="text-lg mb-6">
              Finalizing enrollment. Please wait...
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container max-w-2xl">
          <h1 className="text-2xl font-bold mb-4">
            Payment for {training.name}
          </h1>
          <p className="text-lg mb-2">
            Price: <span className="font-semibold">${training.price}</span>
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Paying as:{" "}
            <span className="font-medium">
              {user?.email} ({user?.full_name})
            </span>
          </p>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold w-full"
            size="lg"
            onClick={handlePayNow}
          >
            Pay Now with Chapa
          </Button>
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
