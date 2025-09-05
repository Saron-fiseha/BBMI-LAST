"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./star-rating";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  courseId: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ courseId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast({
        title: "Review Too Short",
        description: "Please write at least 10 characters for your review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // --- THIS IS THE REPLACEMENT LOGIC ---
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`, // Assuming you use a token
        },
        body: JSON.stringify({
          courseId: courseId,
          rating: rating,
          comment: comment.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit review.");
      }

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });

      // Reset form and notify parent
      setRating(0);
      setComment("");
      onReviewSubmitted();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  //     try {
  //       // Get existing reviews from localStorage
  //       const existingReviews = JSON.parse(
  //         localStorage.getItem(`reviews_${courseId}`) || "[]"
  //       );

  //       // Check if user already reviewed this course
  //       const existingReviewIndex = existingReviews.findIndex(
  //         (review: any) => review.userId === user.id
  //       );

  //       const newReview = {
  //         id: Date.now().toString(),
  //         userId: user.id,
  //         courseId,
  //         rating,
  //         comment: comment.trim(),
  //         userName: user.full_name || user.email || "Anonymous User",
  //         // userImage: user.profile_image_url || "",
  //         createdAt: new Date().toISOString(),
  //       };

  //       if (existingReviewIndex >= 0) {
  //         // Update existing review
  //         existingReviews[existingReviewIndex] = newReview;
  //         toast({
  //           title: "Review Updated",
  //           description: "Your review has been updated successfully.",
  //         });
  //       } else {
  //         // Add new review
  //         existingReviews.push(newReview);
  //         toast({
  //           title: "Review Submitted",
  //           description: "Thank you for your feedback!",
  //         });
  //       }

  //       // Save to localStorage
  //       localStorage.setItem(
  //         `reviews_${courseId}`,
  //         JSON.stringify(existingReviews)
  //       );

  //       // Reset form
  //       setRating(0);
  //       setComment("");

  //       // Notify parent component
  //       onReviewSubmitted();
  //     } catch (error) {
  //       console.error("Error submitting review:", error);
  //       toast({
  //         title: "Submission Failed",
  //         description: "Failed to submit your review. Please try again.",
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">
            Please log in to leave a review for this course.
          </p>
          <Button asChild>
            <a href="/login">Log In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Rating
            </label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Your Review
            </label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this course..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 10 characters ({comment.length}/10)
            </p>
          </div>

          <Button
            type="submit"
            disabled={
              isSubmitting || rating === 0 || comment.trim().length < 10
            }
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
