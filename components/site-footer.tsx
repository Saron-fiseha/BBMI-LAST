"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

// TikTok icon component since it's not in lucide-react
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export function SiteFooter() {
  return (
    // Changed the default text color for the entire footer
    <footer className="bg-charcoal-gray text-custom-tan">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">BBMI</h3>
            {/* Updated text color */}
            <p className="text-custom-tan leading-relaxed">
              Transforming lives through professional beauty education. Join our
              community of successful beauty professionals.
            </p>
            <p>"One Brushstroke at a Time."</p>
            <div className="flex space-x-4">
              {/* Updated link and hover colors */}
              <Link
                href="https://facebook.com/brushedbybettymakeupschool"
                className="text-custom-tan hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              {/* <Link
                href="mailto:brushedbybetty@gmail.com"
                className="text-custom-tan hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </Link> */}
              <Link
                href="https://www.instagram.com/brushedbybetty?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                className="text-custom-tan hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="https://youtube.com/@brushedbybetty?si=KkLOHRhAI7xoyUzE"
                className="text-custom-tan hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </Link>
              <Link
                href="https://vm.tiktok.com/ZMSTy5jY2/"
                className="text-custom-tan hover:text-white transition-colors"
              >
                <TikTokIcon />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
               <li>
                <Link
                  href="/"
                  className="text-custom-tan hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-custom-tan hover:text-white transition-colors"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-custom-tan hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/instructors"
                  className="text-custom-tan hover:text-white transition-colors"
                >
                  Instructors
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio"
                  className="text-custom-tan hover:text-white transition-colors"
                >
                  Portfolio
                </Link>
              </li> */}
              <li>
                <Link
                  href="/contact"
                  className="text-custom-tan hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#announcement"
                  className="text-custom-tan hover:text-white transition-colors"
                >
                  Promotions
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-custom-tan hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/termsofservice"
                  className="text-custom-tan hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacypolicy"
                  className="text-custom-tan hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-custom-tan" />
                <span className="text-custom-tan">
                  22 round about noah city point building 5th floor{" "}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-custom-tan" />
                <span className="text-custom-tan">
                  {" "}
                  lebu mati building 3rd floor
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-custom-tan" />
                <span className="text-custom-tan">
                  {" "}
                  summit yetebaberut, Africa convention center
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-custom-tan" />
                <span className="text-custom-tan">0913218888/ 0912158143</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-custom-tan" />
                <span className="text-custom-tan">
                  brushedbybetty@gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          {/* Updated text color */}
          <p className="text-custom-tan">
            © 2025 Brushed by Betty Makeup Institute. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
