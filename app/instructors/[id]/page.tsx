"use client";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Award,
  Users,
  Star,
  Calendar,
} from "lucide-react";

// Types
interface Instructor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  position: string | null;
  experienceYears: number | null;
  studentsCount: number | null;
  rating: number | null;
  bio: string | null;
  socialLinks: Record<string, string> | null;
  coverPhoto: string | null;
  profilePicture: string | null;
  certifications: string | null;
  achievements: string | null;
  location: string | null;
}

interface Course {
  id: number;
  name: string;
  description: string;
  image_url: string;
  level: string;
  duration: number;
  price: number;
  discount: number;
  modules: number;
  course_code: string;
}

export default function InstructorProfilePage() {
  const params = useParams();
  const { id } = params as { id: string };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function fetchInstructor() {
      try {
        const res = await fetch(`/api/instructors/available/${id}`);
        if (!res.ok) {
          throw new Error("Instructor not found");
        }
        const data = await res.json();
        setInstructor(data.instructor);
        setCourses(data.trainings);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load instructor");
      } finally {
        setLoading(false);
      }
    }

    fetchInstructor();
  }, [id]);

  const { user } = useAuth(); // or useSession()

  const messagesLink =
    user?.role === "student" ? "/dashboard/messages" : "/instructor/messages";

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading...</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Instructor Not Found</h1>
            <p className="text-muted-foreground mb-4">
              {error || "The instructor you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link href="/instructors">Back to Instructors</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Cover Image and Profile */}
        <div className="relative">
          <div className="h-64 md:h-80 w-full overflow-hidden">
            <img
              src={instructor.coverPhoto || "/placeholder.svg"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="container relative -mt-20 md:-mt-24">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-8">
              <div className="h-32 w-32 md:h-48 md:w-48 rounded-full border-4 border-background overflow-hidden bg-background">
                <img
                  src={instructor.profilePicture || "/placeholder.svg"}
                  alt={instructor.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 bg-background p-4 rounded-t-lg">
                <h1 className="text-3xl font-bold">{instructor.name}</h1>
                <p className="text-muted-foreground">{instructor.position}</p>
                <div className="flex flex-wrap gap-4 mt-4">
                  {instructor.experienceYears !== null && (
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      <span>{instructor.experienceYears} Years Experience</span>
                    </div>
                  )}
                  {instructor.studentsCount !== null && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{instructor.studentsCount}+ Students</span>
                    </div>
                  )}
                  {instructor.rating !== null && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{instructor.rating} Instructor Rating</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 mt-4 md:mt-0">
                {instructor.socialLinks?.instagram && (
                  <Link
                    href={instructor.socialLinks.instagram}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Instagram size={20} />
                    <span className="sr-only">Instagram</span>
                  </Link>
                )}
                {instructor.socialLinks?.facebook && (
                  <Link
                    href={instructor.socialLinks.facebook}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Facebook size={20} />
                    <span className="sr-only">Facebook</span>
                  </Link>
                )}
                {instructor.socialLinks?.twitter && (
                  <Link
                    href={instructor.socialLinks.twitter}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Twitter size={20} />
                    <span className="sr-only">Twitter</span>
                  </Link>
                )}
                {instructor.socialLinks?.linkedin && (
                  <Link
                    href={instructor.socialLinks.linkedin}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Linkedin size={20} />
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructor Content */}
        <div className="container py-8">
          <Tabs defaultValue="about" className="space-y-8">
            <TabsList className="w-full justify-start border-b rounded-none p-0">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Biography</h2>
                    <div className="prose max-w-none dark:prose-invert">
                      <p>{instructor.bio}</p>
                    </div>
                  </div>

                  {instructor.achievements && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Achievements</h2>
                      <p>{instructor.achievements}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold mb-4">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {instructor.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {instructor.certifications && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Certifications</h2>
                      <p className="text-sm">{instructor.certifications}</p>
                    </div>
                  )}

                  <div>
                    <h2 className="text-xl font-bold mb-4">Contact</h2>
                    <Button asChild className="w-full">
                      <Link href={messagesLink}>Contact Instructor</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="courses">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">
                  Courses by {instructor.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Card key={course.id} className="overflow-hidden">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={course.image_url || "/placeholder.svg"}
                          alt={course.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2">
                          {course.name}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex justify-between text-sm text-muted-foreground mb-4">
                          <Badge variant="outline">{course.level}</Badge>
                          <span>{course.duration} weeks</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="font-bold">${course.price}</div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/courses/${course.id}`}>
                              View Course
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
