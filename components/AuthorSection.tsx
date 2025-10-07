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
              Betelhem Esknder
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed max-w-xl mx-auto lg:mx-0">
              <p>
                Giving makeup courses in Ethiopia and around the world since 2013, Betelhem 
                Esknder is one of the reference makeup artists and educators in the makeup market.
              </p>
              <p>
                Known in Ethiopia and around the world, Betelhem Esknder has already visited 
                many countries such as: United States, Kenya, South Africa, United Arab 
                Emirates and India, taking her knowledge to dozens of students.
              </p>
              <p>
                Betelhem Esknder's mission is to help makeup artists succeed in their 
                professional careers by improving makeup techniques and knowledge 
                about marketing, photography and entrepreneurship. She is also trained in 
                Marketing, Photography & Mentoring.
              </p>
            </div>
          </div>

          {/* Image Content */}
          <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] lg:h-[520px] flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] h-full rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/betty's-pic-2.png"
                alt="Betelhem Esknder, professional makeup artist and instructor"
                layout="fill"
                // objectFit="cover"
                objectFit="contain"
                className="transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
