"use client"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-sm border border-red-100">
        <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You do not have permission to access this page. Ensure you are logged into an account with the correct privileges.
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => router.back()}
            variant="outline"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => router.push("/dashboard")}
            className="bg-charcoal text-ivory hover:bg-charcoal/90"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
