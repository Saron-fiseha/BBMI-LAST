import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  file_path: string;
  file_type: 'video' | 'image';
}

async function getLatestPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const result = await sql`
      SELECT id, title, description, file_path, file_type
      FROM portfolio_items
      WHERE LOWER(status) = 'published'
      ORDER BY created_at DESC
      LIMIT 3
    `
    return (result || []) as PortfolioItem[];
  } catch (error) {
    console.error("Error fetching announcements from DB:", error);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const apiUrl = `${baseUrl}/api/admin/portfolio?limit=3&page=1&status=published`;
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        return data.portfolioItems || [];
      }
    } catch (fallbackErr) {
      console.error("Fallback fetch error:", fallbackErr);
    }
    return [];
  }
}

export async function AnnouncementsSection() {
  const announcements = await getLatestPortfolioItems();

  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <section id="announcement" className="bg-slate-50 py-20 sm:py-24">
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

        {/* Announcements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.map((item) => (
            <Link href={`/portfolio/${item.id}`} key={item.id} className="group block">
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                {/* Media Section */}
                <div className="relative w-full aspect-video bg-black/5">
                  {item.file_type === "video" ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      controlsList="nodownload"
                      onContextMenu={(e) => e.preventDefault()}
                      className="absolute inset-0 w-full h-full object-cover"
                    >
                      <source src={item.file_path} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image
                      src={item.file_path || "/placeholder.svg"}
                      alt={item.title || "Announcement image"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>

                {/* Content Section */}
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
