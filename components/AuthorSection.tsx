import Image from "next/image";

export function AuthorSection() {
  return (
    // Section with a light, warm background
    <section className="bg-[#F5F1E9] py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
          
          {/* Text Content */}
          <div className="space-y-5">
            {/* Changed text to "Meet Your Teacher" and updated color */}
            <p className="text-xl font-semibold uppercase tracking-wider text-gray-600">
              Meet Your Teacher
            </p>
            {/* Changed heading text color to black */}
            <h2 className="text-4xl md:text-5xl font-bold text-custom-copper">
              Betelhem Esknder
            </h2>
            {/* Changed paragraph text color to a dark gray for readability */}
            <div className="space-y-4 text-gray-800 leading-relaxed">
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
          <div className="flex justify-center lg:justify-end">
             {/* Increased the width and height of the image container */}
             <div className="relative w-[440px] h-[440px] sm:w-[380px] sm:h-[480px] lg:w-[420px] lg:h-[520px] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/betty's-pic-2.png"
                  alt="Betelhem Esknder, professional makeup artist and instructor"
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 hover:scale-105"
                />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}