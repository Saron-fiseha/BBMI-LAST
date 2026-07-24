import Image from "next/image"

export function AuthorSection() {
  return (
    <section className="bg-[#F5F1E9] py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">

          {/* Text Content */}
          <div className="space-y-5 text-center lg:text-left">
            <p className="text-lg sm:text-xl font-semibold uppercase tracking-wider text-gray-600">
              Meet Your Teacher
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-custom-copper">
              Bethlehem Eskinder
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed max-w-xl mx-auto lg:mx-0">
              <p>
                Bethlehem Eskinder, widely known as Betty, is the Founder and CEO of
                Brushed by Betty Makeup Institution (BBMI), one of Ethiopia's leading beauty
                training academies. With over 10 years of professional experience, she has
                built a distinguished reputation as a visionary entrepreneur, makeup artist,
                trainer, mentor, and business leader.
              </p>
              <p>
                Driven by a passion for personal transformation and recognizing the untapped
                potential of the beauty industry, she established BBMI to empower individuals
                through quality education. Under her leadership, the institution has trained
                thousands of students across more than 18 beauty disciplines.
              </p>
              <p>
                Recognized as one of Ethiopia's influential women entrepreneurs, Bethlehem
                is dedicated to creating sustainable employment and youth empowerment. Her
                vision is to expand BBMI internationally, showcasing Ethiopian talent, creativity,
                and innovation on the global stage.
              </p>
            </div>
          </div>

          {/* Image Content */}
          <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] lg:h-[520px] flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] h-full rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/betty's-pic-2.png"
                alt="Betelhem Esknder, professional makeup artist and instructor"
                fill
                className="object-contain transition-transform duration-500 hover:scale-105"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
