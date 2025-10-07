import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

// Define a type for the portfolio item data we expect from the API
interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  file_path: string;
  file_type: 'video' | 'image';
}

// --- Data fetching function ---
// This function calls your existing portfolio API to get the latest 3 items.
async function getLatestPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    // We construct the URL to fetch the first page with a limit of 3 items.
    const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/portfolio?limit=3&page=1`;

    const res = await fetch(apiUrl, {
      // This caches the data and re-fetches it at most once every 60 seconds.
      // This prevents hitting your database on every single page load.
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch portfolio items: ${res.statusText}`);
    }

    const data = await res.json();
    
    // Your API returns data inside a `portfolioItems` key
    return data.portfolioItems || [];

  } catch (error) {
    console.error("Error fetching announcements:", error);
    // Return an empty array on error to prevent the page from crashing.
    return [];
  }
}


// The component is now an `async` function, allowing us to use `await`
export async function AnnouncementsSection() {
  // Fetch the latest items when the component renders on the server
  const announcements = await getLatestPortfolioItems();

  // If there's no data, we can choose to render nothing
  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <section  id="announcement" className="bg-slate-50 py-20 sm:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Latest News & Promotions
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with our latest course announcements, special offers, and institute news.
          </p>
        </div>

        {/* Announcements Grid - Now mapping over data fetched from your API */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.map((item) => (
            // The link now dynamically points to a portfolio detail page
            <Link href={`/portfolio/${item.id}`} key={item.id} className="group block">
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                {/* Media Section: Uses `file_type` and `file_path` from your API */}
                <div className="relative w-full aspect-video">
                  {item.file_type === "video" ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src={item.file_path} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image
                      src={item.file_path}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>

                {/* Content Section: Uses `title` and `description` from your API */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed flex-grow">
                    {item.description}
                  </p>
                  <div className="mt-4">
                    <span className="font-semibold text-custom-copper group-hover:text-custom-tan transition-colors duration-300 flex items-center">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}