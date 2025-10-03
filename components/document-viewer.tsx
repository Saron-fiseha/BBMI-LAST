// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { useAuth } from "@/hooks/use-auth";

// interface Document {
//   id: string;
//   file_name: string;
//   file_url: string;
// }

// interface DocumentViewerProps {
//   document: Document;
//   onClose: () => void;
//   userName?: string; // <-- add this
// }

// export default function DocumentViewer({
//   document,
//   onClose,
//   userName,
// }: DocumentViewerProps) {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//       <div className="relative w-[80%] h-[80%] bg-white rounded-xl shadow-lg overflow-hidden">
//         {/* Watermark */}
//         <div className="absolute top-4 left-4 opacity-20 text-2xl font-bold pointer-events-none">
//           {user?.full_name || "Authorized User"}
//         </div>

//         {/* Document iframe */}
//         <iframe
//           src={document.file_url}
//           className="w-full h-full"
//           onLoad={() => setLoading(false)}
//         />

//         {loading && (
//           <div className="absolute inset-0 flex items-center justify-center bg-white/50">
//             Loading document...
//           </div>
//         )}

//         {/* Close Button */}
//         <Button className="absolute top-4 right-4" onClick={onClose}>
//           Close
//         </Button>
//       </div>
//     </div>
//   );
// }
// C:\Users\Hp\Documents\BBMI-LMS\components\document-viewer.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { X } from "lucide-react";
import { Loader2 } from "lucide-react"; // Import Loader2 for spinner

interface Document {
  id: string;
  file_name: string;
  file_url: string;
}

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
  userName?: string;
}

export default function DocumentViewer({
  document,
  onClose,
  userName,
}: DocumentViewerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const displayUserName = userName || user?.full_name || "Authorized User";

  // Use useEffect to log the document URL when the component mounts or document changes
  useEffect(() => {
    if (document && document.file_url) {
      console.log("DocumentViewer attempting to load URL:", document.file_url);
      setLoading(true); // Ensure loading is true when a new document is set
    } else {
      console.error("DocumentViewer received no document or invalid file_url.");
      setLoading(false); // Stop loading if no valid URL is provided
    }
  }, [document]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-2">
      {" "}
      {/* Reduce outer padding even more */}
      <div
        className="relative bg-white rounded-none shadow-lg overflow-hidden
                   w-screen h-screen max-w-none max-h-none
                   md:rounded-xl md:w-[95vw] md:h-[95vh] md:max-w-4xl md:max-h-[95vh]
                   lg:w-[85vw] lg:h-[85vh]" // Make it full screen on small, then scale down
      >
        {/* Watermark (Ensure it's not accidentally on top of content) */}
        <div className="absolute top-5 left-5 opacity-20 text-xl md:text-2xl font-bold pointer-events-none z-10">
          {" "}
          {/* Slight adjustment to position */}
          {displayUserName}
        </div>

        {/* Document iframe */}
        <iframe
          src={document.file_url}
          className="w-full h-full border-none" // Ensure no default iframe border
          onLoad={() => {
            console.log(
              "Document iframe loaded successfully:",
              document.file_url
            );
            setLoading(false);
          }}
          onError={(e) => {
            console.error("Error event on iframe:", e);
            console.error(
              "Failed to load document in iframe with URL:",
              document.file_url
            );
            setLoading(false);
          }}
          title="Document Viewer"
        />

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20">
            <Loader2 className="h-10 w-10 animate-spin text-custom-copper" />
            <span className="mt-3 text-lg text-gray-700">
              Loading document...
            </span>
          </div>
        )}

        {/* Close Button */}
        <Button
          className="absolute top-3 right-3 z-30 p-2 bg-gray-200 hover:bg-gray-300 rounded-full"
          onClick={onClose}
          variant="ghost"
          size="icon"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close document viewer</span>
        </Button>
      </div>
    </div>
  );
}
