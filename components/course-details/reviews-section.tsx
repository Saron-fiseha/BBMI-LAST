
"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

// --- Interface to match your page's data structure ---
interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  user_image_url: string;
}

const StarDisplay = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ))}
  </div>
);

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold">No Reviews Yet</h3>
        <p className="text-muted-foreground mt-2">
          Be the first to review this course after you enroll and complete it!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Student Feedback</h2>
      {reviews.map((review) => (
        <div key={review.id} className="flex items-start gap-4">
          <Image
            src={review.user_image_url || "/default-avatar.png"}
            alt={review.user_name}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{review.user_name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <StarDisplay rating={review.rating} />
            </div>
            <p className="mt-2 text-foreground/80">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
