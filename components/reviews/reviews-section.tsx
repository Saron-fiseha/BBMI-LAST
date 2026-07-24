"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";

// --- Interfaces ---
interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
  user_image_url: string;
}

interface UserReview {
  hasReviewed: boolean;
  review?: Review;
}

// --- StarRating Component ---
const StarRating = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (rating: number) => void;
}) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`cursor-pointer h-8 w-8 transition-colors ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
          onClick={() => setRating(star)}
        />
      ))}
    </div>
  );
};

// --- Main ReviewsSection Component ---
export function ReviewsSection({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<UserReview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewsAndUserStatus = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        // Fetch all reviews for the course
        const res = await fetch(`/api/reviews?trainingId=${courseId}`);
        const data = await res.json();
        if (res.ok) {
          setReviews(data);
          // Check if the current user's review is in the list
          const existingReview = data.find((r: any) => r.user_id === user?.id);
          if (existingReview) {
            setUserReview({ hasReviewed: true, review: existingReview });
          } else {
            setUserReview({ hasReviewed: false });
          }
        } else {
          throw new Error(data.error || "Failed to fetch reviews");
        }
      } catch (error) {
        console.error("Fetch reviews error:", error);
        toast({
          title: "Error",
          description: "Could not load reviews.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchReviewsAndUserStatus();
  }, [courseId, toast, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === "") {
      toast({
        title: "Incomplete Review",
        description: "Please provide a rating and a comment.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ trainingId: courseId, rating, comment }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review.");
      }

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });

      // Refresh reviews list and disable form
      const newReview = { ...data.review, user_name: user?.full_name };
      setReviews((prev) => [newReview, ...prev]);
      setUserReview({ hasReviewed: true, review: newReview });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Reviews & Ratings</CardTitle>
        <CardDescription>
          Share your experience to help other students.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userReview?.hasReviewed ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-center">
            <h3 className="text-lg font-semibold text-green-800">
              Thank you for your review!
            </h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Rating
              </label>
              <StarRating rating={rating} setRating={setRating} />
            </div>
            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium mb-2"
              >
                Your Review
              </label>
              <Textarea
                id="comment"
                placeholder="Tell us about your experience with this course..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
