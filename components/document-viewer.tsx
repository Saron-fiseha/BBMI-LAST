"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface Document {
  id: string;
  file_name: string;
  file_url: string;
}

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
  userName?: string; // <-- add this
}

export default function DocumentViewer({
  document,
  onClose,
  userName,
}: DocumentViewerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-[80%] h-[80%] bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Watermark */}
        <div className="absolute top-4 left-4 opacity-20 text-2xl font-bold pointer-events-none">
          {user?.full_name || "Authorized User"}
        </div>

        {/* Document iframe */}
        <iframe
          src={document.file_url}
          className="w-full h-full"
          onLoad={() => setLoading(false)}
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            Loading document...
          </div>
        )}

        {/* Close Button */}
        <Button className="absolute top-4 right-4" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
