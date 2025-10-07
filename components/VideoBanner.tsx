// "use client"

// import Link from "next/link"
// import YouTube from "react-youtube"

// export function VideoBanner() {
//   // NOTE: I've updated the video ID to match the one in your screenshot (roses)
//   // You can change this back if you prefer the other video.
//   const videoId = "tKM1_B4Ez7k";

//   const youtubePlayerOptions = {
//     playerVars: {
//       autoplay: 1,
//       controls: 0,
//       rel: 0,
//       showinfo: 0,
//       mute: 1,
//       loop: 1,
//       playlist: videoId,
//     },
//   };

//   return (
//     <section className="relative h-screen w-full flex items-center justify-start overflow-hidden">
//       {/* Container for the YouTube player */}
//       <div className="absolute top-0 left-0 w-full h-full z-0">
//         <YouTube
//           videoId={videoId}
//           opts={youtubePlayerOptions}
//           className="w-full h-full"
//           // --- THE FIX ---
//           // The `w-auto` class has been removed. This allows `min-w-full` and `min-h-full`
//           // to work together to force the iframe to cover the entire area, regardless of
//           // the screen's aspect ratio.
//           iframeClassName="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2"
//         />
//       </div>

//       {/* Dark Overlay */}
//       <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10" />

//       {/* Text Content */}
//       <div className="relative z-20 text-left text-white max-w-2xl px-8 sm:px-12 lg:px-24">
//         <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
//           All makeup styles
//           <span className="block text-custom-tan mt-2">in one place</span>
//         </h1>
//         <p className="mt-6 text-lg sm:text-xl text-gray-200 leading-relaxed">
//           Learn from the smooth and neutral makeup for customer service, 
//           even the most daring, colorful and artistic, and unlock all your potential!
//         </p>

//        <Link
//          href="/courses"
//          className="mt-8 inline-block bg-gradient-to-r from-custom-copper to-custom-tan text-white font-bold py-3 px-10 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105"
//       >
//          START NOW
//        </Link>
//       </div>
//     </section>
//   );
// }



// // "otej7WLdPh0}
"use client"

import Link from "next/link"

export function VideoBanner() {
  return (
    <section className="relative h-screen w-full flex items-center justify-start overflow-hidden">
      {/* Local Video Background */}
      {/* <video
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/makeup-banner.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video> */}
      <video
  className="absolute top-0 left-0 w-full h-full object-cover z-0"
  autoPlay
  muted
  loop
  playsInline
>
  <source src="/videos/makeup-banner.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>


      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10" />

      {/* Text Content */}
      <div className="relative z-20 text-left text-white max-w-2xl px-8 sm:px-12 lg:px-24">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
          All makeup styles
          <span className="block text-custom-tan mt-2">in one place</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-200 leading-relaxed">
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
