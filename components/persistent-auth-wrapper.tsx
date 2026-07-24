
"use client";

import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/loading-spinner";

interface PersistentAuthWrapperProps {
  children: React.ReactNode;
}

export function PersistentAuthWrapper({
  children,
}: PersistentAuthWrapperProps) {
  const { loading } = useAuth();

  // While the auth state is loading, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-charcoal/60">Loading BBMI...</p>
        </div>
      </div>
    );
  }

  // Once loading is done, render children normally
  return <>{children}</>;
}
