// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/hooks/use-auth";
// import { SiteHeader } from "@/components/site-header";
// import { SiteFooter } from "@/components/site-footer";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { useToast } from "@/hooks/use-toast";
// import {
//   CreditCard,
//   Shield,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   Loader2,
//   ArrowLeft,
// } from "lucide-react";
// import Link from "next/link";

// interface Training {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   duration: number;
//   level: string;
//   image_url: string;
//   instructor_name: string;
//   discount: number;
//   modules: number;
// }

// export default function PaymentPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const [training, setTraining] = useState<Training | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [paymentId, setPaymentId] = useState<string | null>(null);
//   const [verificationAttempts, setVerificationAttempts] = useState(0);

//   const { user, isAuthenticated } = useAuth();
//   const router = useRouter();
//   const { toast } = useToast();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (!isAuthenticated) {
//           router.push("/login");
//           return;
//         }

//         const resolvedParams = await params;
//         const response = await fetch(`/api/courses/${resolvedParams.id}`);

//         if (!response.ok) {
//           throw new Error("Failed to fetch training");
//         }

//         const data = await response.json();
//         setTraining(data.training);
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "Failed to load training"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [params, isAuthenticated, router]);

//   const handlePayment = async () => {
//     if (!training || !user) return;

//     setProcessing(true);
//     setError(null);

//     try {
//       // Initiate payment
//       const response = await fetch("/api/payments/initiate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
//         },
//         body: JSON.stringify({
//           trainingId: training.id,
//         }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         setPaymentId(data.paymentId);

//         // Redirect to Telebirr payment page
//         if (data.paymentUrl) {
//           window.location.href = data.paymentUrl;
//         } else {
//           // Start verification polling if no redirect URL
//           startPaymentVerification(data.paymentId);
//         }
//       } else {
//         throw new Error(data.message || "Payment initiation failed");
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Payment failed");
//       setProcessing(false);
//     }
//   };

//   const startPaymentVerification = (paymentId: string) => {
//     const maxAttempts = 30; // 5 minutes with 10-second intervals

//     const verifyPayment = async () => {
//       try {
//         const response = await fetch("/api/payments/verify", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
//           },
//           body: JSON.stringify({ paymentId }),
//         });

//         const data = await response.json();

//         if (data.success && data.status === "completed") {
//           toast({
//             title: "Payment Successful!",
//             description: "You have been enrolled in the training.",
//           });
//           if (training) {
//             router.push(`/courses/${training.id}?enrolled=true`);
//           }
//           return;
//         }

//         if (data.status === "failed" || data.status === "cancelled") {
//           throw new Error(data.message || "Payment failed");
//         }

//         // Continue polling if still processing
//         if (verificationAttempts < maxAttempts) {
//           setVerificationAttempts((prev) => prev + 1);
//           setTimeout(verifyPayment, 10000); // Check again in 10 seconds
//         } else {
//           throw new Error("Payment verification timeout");
//         }
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "Payment verification failed"
//         );
//         setProcessing(false);
//       }
//     };

//     verifyPayment();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <SiteHeader />
//         <main className="flex-1 flex items-center justify-center">
//           <div className="flex items-center space-x-2">
//             <Loader2 className="h-6 w-6 animate-spin" />
//             <span>Loading payment details...</span>
//           </div>
//         </main>
//         <SiteFooter />
//       </div>
//     );
//   }

//   if (error || !training) {
//     return (
//       <div className="min-h-screen flex flex-col">
//         <SiteHeader />
//         <main className="flex-1 flex items-center justify-center">
//           <Card className="w-full max-w-md">
//             <CardContent className="pt-6">
//               <div className="flex items-center space-x-2 text-red-600">
//                 <AlertCircle className="h-5 w-5" />
//                 <span>{error || "Training not found"}</span>
//               </div>
//               <Button asChild className="w-full mt-4">
//                 <Link href="/courses">Back to Courses</Link>
//               </Button>
//             </CardContent>
//           </Card>
//         </main>
//         <SiteFooter />
//       </div>
//     );
//   }

//   const discountedPrice =
//     training.discount > 0
//       ? training.price * (1 - training.discount / 100)
//       : training.price;

//   return (
//     <div className="min-h-screen flex flex-col">
//       <SiteHeader />
//       <main className="flex-1 container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Back Button */}
//           <Button variant="ghost" asChild className="mb-6">
//             <Link href={`/courses/${training.id}`}>
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Course
//             </Link>
//           </Button>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Training Details */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Training Details</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="aspect-video relative rounded-lg overflow-hidden">
//                   <img
//                     src={
//                       training.image_url ||
//                       "/placeholder.svg?height=200&width=300"
//                     }
//                     alt={training.name}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>

//                 <div>
//                   <h3 className="text-xl font-semibold mb-2">
//                     {training.name}
//                   </h3>
//                   <p className="text-gray-600 mb-4">{training.description}</p>

//                   <div className="flex flex-wrap gap-2 mb-4">
//                     <Badge variant="secondary">{training.level}</Badge>
//                     <Badge variant="outline">
//                       <Clock className="h-3 w-3 mr-1" />
//                       {Math.floor(training.duration / 60)}h{" "}
//                       {training.duration % 60}m
//                     </Badge>
//                     <Badge variant="outline">{training.modules} modules</Badge>
//                   </div>

//                   <p className="text-sm text-gray-600">
//                     Instructor: {training.instructor_name}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Payment Details */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center">
//                   <CreditCard className="h-5 w-5 mr-2" />
//                   Payment Summary
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Price Breakdown */}
//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span>Course Price</span>
//                     <span>
//                       ETB{" "}
//                       {training.price != null
//                         ? Number(training.price).toFixed(2)
//                         : "N/A"}
//                     </span>
//                   </div>

//                   {training.discount > 0 && (
//                     <div className="flex justify-between text-green-600">
//                       <span>Discount ({training.discount}%)</span>
//                       <span>
//                         -ETB{" "}
//                         {((training.price * training.discount) / 100).toFixed(
//                           2
//                         )}
//                       </span>
//                     </div>
//                   )}

//                   <Separator />

//                   <div className="flex justify-between text-lg font-semibold">
//                     <span>Total Amount</span>
//                     <span>ETB {(Number(discountedPrice) || 0).toFixed(2)}</span>
//                   </div>
//                 </div>

//                 {/* Payment Method */}
//                 <div className="space-y-3">
//                   <h4 className="font-medium">Payment Method</h4>
//                   <div className="border rounded-lg p-3 bg-blue-50">
//                     <div className="flex items-center space-x-3">
//                       <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
//                         <span className="text-white text-xs font-bold">T</span>
//                       </div>
//                       <div>
//                         <p className="font-medium">Telebirr</p>
//                         <p className="text-sm text-gray-600">
//                           Secure mobile payment
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Security Notice */}
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <div className="flex items-start space-x-2">
//                     <Shield className="h-5 w-5 text-green-600 mt-0.5" />
//                     <div className="text-sm">
//                       <p className="font-medium text-gray-900">
//                         Secure Payment
//                       </p>
//                       <p className="text-gray-600">
//                         Your payment is processed securely through Telebirr's
//                         encrypted system.
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* What's Included */}
//                 <div className="space-y-3">
//                   <h4 className="font-medium">What's Included</h4>
//                   <div className="space-y-2">
//                     <div className="flex items-center space-x-2 text-sm">
//                       <CheckCircle className="h-4 w-4 text-green-600" />
//                       <span>Full access to all course materials</span>
//                     </div>
//                     <div className="flex items-center space-x-2 text-sm">
//                       <CheckCircle className="h-4 w-4 text-green-600" />
//                       <span>Progress tracking and certificates</span>
//                     </div>
//                     <div className="flex items-center space-x-2 text-sm">
//                       <CheckCircle className="h-4 w-4 text-green-600" />
//                       <span>Lifetime access to content</span>
//                     </div>
//                     <div className="flex items-center space-x-2 text-sm">
//                       <CheckCircle className="h-4 w-4 text-green-600" />
//                       <span>Instructor support</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Error Display */}
//                 {error && (
//                   <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                     <div className="flex items-center space-x-2 text-red-600">
//                       <AlertCircle className="h-5 w-5" />
//                       <span className="text-sm">{error}</span>
//                     </div>
//                   </div>
//                 )}

//                 {/* Payment Button */}
//                 <Button
//                   onClick={handlePayment}
//                   disabled={processing}
//                   className="w-full"
//                   size="lg"
//                 >
//                   {processing ? (
//                     <>
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                       {paymentId ? "Verifying Payment..." : "Processing..."}
//                     </>
//                   ) : (
//                     <>
//                       <CreditCard className="h-4 w-4 mr-2" />
//                       Pay ETB {(Number(discountedPrice) || 0).toFixed(2)}
//                     </>
//                   )}
//                 </Button>

//                 {processing && paymentId && (
//                   <div className="text-center text-sm text-gray-600">
//                     <p>Please complete your payment in the Telebirr app</p>
//                     <p>Verification attempt: {verificationAttempts}/30</p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </main>
//       <SiteFooter />
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Training {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  level: string;
  image_url: string;
  instructor_name: string;
  discount: number;
  modules: number;
}

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isAuthenticated) {
          router.push("/login");
          return;
        }

        const resolvedParams = await params;
        const response = await fetch(`/api/courses/${resolvedParams.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch training");
        }

        const data = await response.json();
        setTraining(data.training);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load training"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, isAuthenticated, router]);

  const handlePayment = async () => {
    if (!training || !user) return;

    setProcessing(true);
    setError(null);

    try {
      // Initiate payment
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          trainingId: training.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentId(data.paymentId);

        // Redirect to Telebirr payment page
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          // Start verification polling if no redirect URL
          startPaymentVerification(data.paymentId);
        }
      } else {
        throw new Error(data.message || "Payment initiation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setProcessing(false);
    }
  };

  const startPaymentVerification = (paymentId: string) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals

    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ paymentId }),
        });

        const data = await response.json();

        if (data.success && data.status === "completed") {
          toast({
            title: "Payment Successful!",
            description: "You have been enrolled in the training.",
          });
          if (training) {
            router.push(`/courses/${training.id}?enrolled=true`);
          }
          return;
        }

        if (data.status === "failed" || data.status === "cancelled") {
          throw new Error(data.message || "Payment failed");
        }

        // Continue polling if still processing
        if (verificationAttempts < maxAttempts) {
          setVerificationAttempts((prev) => prev + 1);
          setTimeout(verifyPayment, 10000); // Check again in 10 seconds
        } else {
          throw new Error("Payment verification timeout");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Payment verification failed"
        );
        setProcessing(false);
      }
    };

    verifyPayment();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading payment details...</span>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error || "Training not found"}</span>
              </div>
              <Button asChild className="w-full mt-4">
                <Link href="/courses">Back to Courses</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const discountedPrice =
    training.discount > 0
      ? training.price * (1 - training.discount / 100)
      : training.price;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href={`/courses/${training.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Training Details */}
            <Card>
              <CardHeader>
                <CardTitle>Training Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img
                    src={
                      training.image_url ||
                      "/placeholder.svg?height=200&width=300"
                    }
                    alt={training.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {training.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{training.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{training.level}</Badge>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor(training.duration / 60)}h{" "}
                      {training.duration % 60}m
                    </Badge>
                    <Badge variant="outline">{training.modules} modules</Badge>
                  </div>

                  <p className="text-sm text-gray-600">
                    Instructor: {training.instructor_name}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Course Price</span>
                    <span>ETB {Number(training?.price ?? 0).toFixed(2)}</span>
                  </div>

                  {training.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({training.discount}%)</span>
                      <span>
                        -ETB{" "}
                        {((training.price * training.discount) / 100).toFixed(
                          2
                        )}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span>ETB {Number(discountedPrice ?? 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <h4 className="font-medium">Payment Method</h4>
                  <div className="border rounded-lg p-3 bg-blue-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">T</span>
                      </div>
                      <div>
                        <p className="font-medium">Telebirr</p>
                        <p className="text-sm text-gray-600">
                          Secure mobile payment
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        Secure Payment
                      </p>
                      <p className="text-gray-600">
                        Your payment is processed securely through Telebirr's
                        encrypted system.
                      </p>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="space-y-3">
                  <h4 className="font-medium">What's Included</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Full access to all course materials</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Progress tracking and certificates</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Lifetime access to content</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Instructor support</span>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {paymentId ? "Verifying Payment..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ETB {Number(discountedPrice ?? 0).toFixed(2)}
                    </>
                  )}
                </Button>

                {processing && paymentId && (
                  <div className="text-center text-sm text-gray-600">
                    <p>Please complete your payment in the Telebirr app</p>
                    <p>Verification attempt: {verificationAttempts}/30</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
