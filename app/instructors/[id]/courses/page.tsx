"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface Training {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  image: string | null;
}

export default function InstructorCoursesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        // const res = await fetch(`/api/instructors/${id}/courses`);
        const res = await fetch(`/api/instructors/available/${id}/courses`);

        const data = await res.json();
        if (data.success && Array.isArray(data.trainings)) {
          setTrainings(data.trainings);
        }
      } catch (error) {
        console.error("Failed to fetch trainings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, [id]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-muted py-12">
          <div className="container text-center">
            <h1 className="text-4xl font-bold mb-4">Instructor's Courses</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse the trainings offered by this instructor.
            </p>
          </div>
        </div>

        {/* Trainings Grid */}
        <div className="container py-12">
          {loading ? (
            <div className="text-center text-muted-foreground">
              Loading courses...
            </div>
          ) : trainings.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No courses found for this instructor.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trainings.map((training) => (
                <Card
                  key={training.id}
                  className="overflow-hidden transition-all hover:shadow-lg"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={
                        training.image ||
                        "/placeholder.svg?height=200&width=400"
                      }
                      alt={training.title}
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                    />
                    <Badge className="absolute top-4 left-4">
                      {training.category}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{training.title}</CardTitle>
                    <CardDescription>{training.level}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {training.description || "No description provided."}
                    </p>

                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Badge variant="outline">{training.duration}</Badge>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{training.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="font-bold">${training.price}</div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/courses/${training.id}`}>
                          View Course
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
