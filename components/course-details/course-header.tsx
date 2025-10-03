import { Star, Users, Clock, BookOpen } from "lucide-react";
import Image from "next/image";

interface CourseHeaderProps {
  categoryName: string;
  name: string;
  description: string;
  avgRating: number;
  totalReviews: number;
  // studentCount: number;
  duration: number; // in weeks
  // lessonsCount: number;
  modulesCount: number; // total number of modules
  instructor: {
    name: string;
    title: string;
    image_url: string;
  };
}

export const CourseHeader = ({
  categoryName,
  name,
  description,
  avgRating,
  totalReviews,
  // studentCount,
  duration,
  // lessonsCount,
  modulesCount,
  instructor,
}: CourseHeaderProps) => (
  <div className="mb-8">
    <div className="text-sm font-bold uppercase text-custom-copper mb-2">
      {categoryName}
    </div>
    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
      {name}
    </h1>
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      {description}
    </p>

    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-slate-800">{avgRating.toFixed(1)}</span>
        <Star className="h-4 w-4 text-custom-copper fill-custom-copper" />
        <span>({totalReviews} reviews)</span>
      </div>
      {/* <div className="flex items-center gap-1.5">
        <Users className="h-4 w-4" />
        <span>{studentCount} students</span>
      </div> */}
      <div className="flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        <span>{duration} minuets</span>
      </div>
      <div className="flex items-center gap-1.5">
        <BookOpen className="h-4 w-4" />
        {/* <span>{lessonsCount} lessons</span> */}
        <span>{modulesCount} modules</span>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <Image
        src={instructor.image_url || "/placeholder.svg"}
        alt={instructor.name}
        width={40}
        height={40}
        className="rounded-full"
      />
      <div>
        <p className="font-semibold">{instructor.name}</p>
        <p className="text-sm text-muted-foreground">{instructor.title}</p>
      </div>
    </div>
  </div>
);
