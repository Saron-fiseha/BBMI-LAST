"use client"

import Link from "next/link"

export function VideoBanner() {
  return (
    <section className="relative min-h-[90vh] md:min-h-[100vh] w-full flex items-center justify-start overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover object-top z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/banner.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Subtle Gradient Overlay for text readability while preserving natural video brightness */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/60 via-black/25 to-transparent z-10" />

      {/* Text Content */}
      <div className="relative z-20 text-left text-white max-w-2xl px-8 sm:px-12 lg:px-24 drop-shadow-md">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight drop-shadow-lg">
          All makeup styles
          <span className="block text-custom-tan mt-2">in one place</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-100 leading-relaxed drop-shadow">
          Learn from the smooth and neutral makeup for customer service, 
          even the most daring, colorful and artistic, and unlock all your potential!
        </p>

        <Link
          href="/courses"
          className="mt-8 inline-block bg-gradient-to-r from-custom-copper to-custom-tan text-white font-bold py-3 px-10 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105"
        >
          START NOW
        </Link>
      </div>
    </section>
  )
}
