// C:\Users\Hp\Documents\BBMI-LMS\app\verify\layout.tsx

// It's a server component by default, no "use client" needed here unless you add client-side hooks/interactions
import React from "react";
// If you were importing "inter" for className, ensure it's still available or remove it if not used.
// import { Inter } from 'next/font/google'; // Example if you used it
// const inter = Inter({ subsets: ['latin'] });

interface VerifyLayoutProps {
  children: React.ReactNode;
}

export default function VerifyLayout({ children }: VerifyLayoutProps) {
  return (
    // REMOVE the <html> and <body> tags from here.
    // Only render the content that should be inside the main <body>.
    // You can wrap children in a div if you need a container for styling specific to the /verify route.
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Any specific layout or shared components for the /verify route can go here */}
      {/* For instance, if you want a header or footer specific to the verification page, you'd put it here */}
      {children}
    </div>
  );
}
