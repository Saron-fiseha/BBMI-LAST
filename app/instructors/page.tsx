"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Award } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";

interface Instructor {
  id: number;
  name: string;
  email: string;
  bio: string;
  profile_picture: string | null;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch("/api/instructors/available");
        const data = await res.json();
        if (data.success && Array.isArray(data.instructors)) {
          setInstructors(data.instructors);
        }
      } catch (error) {
        console.error("Failed to fetch instructors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <BlurFade delay={0.2}>
          <div className="bg-muted py-12">
            <div className="container">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">
                  Meet Our Expert Instructors
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Learn from industry professionals with years of experience and
                  proven track records in the beauty industry.
                </p>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Instructors Grid */}
        <div className="container py-12">
          {loading ? (
            <BlurFade delay={0.2}>
              <div className="text-center text-muted-foreground">
                Loading instructors...
              </div>
            </BlurFade>
          ) : instructors.length === 0 ? (
            <BlurFade delay={0.2}>
              <div className="text-center text-muted-foreground">
                No instructors found.
              </div>
            </BlurFade>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {instructors.map((instructor) => (
                <BlurFade key={instructor.id} delay={0.2}>
                  <Card
                    className="overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-2 hover:scale-[1.02]"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={
                          instructor.profile_picture ||
                          "/placeholder.svg?height=300&width=300"
                        }
                        alt={instructor.name}
                        className="object-cover w-full h-full transition-transform hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{instructor.name}</CardTitle>
                      <CardDescription>Instructor</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {instructor.bio || "No biography provided."}
                      </p>

                      {/* Fake placeholder specialties to keep design consistent */}
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          Beauty
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Training
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Award className="h-4 w-4" />
                          </div>
                          <div className="font-medium">N/A</div>
                          <div className="text-muted-foreground">Experience</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="font-medium">N/A</div>
                          <div className="text-muted-foreground">Students</div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center mb-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                          </div>
                          <div className="font-medium">N/A</div>
                          <div className="text-muted-foreground">Rating</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/instructors/${instructor.id}`}>
                            View Profile
                          </Link>
                        </Button>
                        <Button size="sm" className="flex-1" asChild>
                          <Link href={`/instructors/${instructor.id}/courses`}>
                            View Courses
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </BlurFade>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <BlurFade delay={0.2}>
          <div className="bg-muted py-12">
            <div className="container text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Learn from the Best?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of students who have transformed their careers with
                our expert-led courses.
              </p>
              <Button size="lg" asChild>
                <Link href="/courses">Browse All Courses</Link>
              </Button>
            </div>
          </div>
        </BlurFade>
      </main>
      <SiteFooter />
    </div>
  );
}