// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Star } from "lucide-react";

// interface Review {
//   id: string;
//   rating: number;
//   comment: string;
//   created_at: string;
//   user_name: string;
//   user_image_url: string;
// }

// const timeAgo = (date: string) => {
//   // Simple time ago function, you can use a library like `date-fns` for more accuracy
//   const seconds = Math.floor(
//     (new Date().getTime() - new Date(date).getTime()) / 1000
//   );
//   let interval = seconds / 31536000;
//   if (interval > 1) return Math.floor(interval) + " years ago";
//   interval = seconds / 2592000;
//   if (interval > 1) return Math.floor(interval) + " months ago";
//   interval = seconds / 86400;
//   if (interval > 1) return Math.floor(interval) + " days ago";
//   return "Today";
// };

// export const ReviewsSection = ({ reviews = [] }: { reviews: Review[] }) => {
//   const avgRating =
//     reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

//   return (
//     <div>
//       <h3 className="text-2xl font-bold mb-4">Student Reviews</h3>

//       {reviews.length > 0 && (
//         <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg mb-8">
//           <div className="text-5xl font-bold text-amber-600">
//             {avgRating.toFixed(1)}
//           </div>
//           <div className="flex flex-col">
//             <div className="flex items-center">
//               {[...Array(5)].map((_, i) => (
//                 <Star
//                   key={i}
//                   className={`h-5 w-5 ${i < Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
//                 />
//               ))}
//             </div>
//             <div className="text-sm text-muted-foreground">
//               Based on {reviews.length} reviews
//             </div>
//           </div>
//         </div>
//       )}

//       {reviews.length > 0 ? (
//         <div className="space-y-6">
//           {reviews.map((review) => (
//             <div
//               key={review.id}
//               className="flex items-start gap-4 border-b pb-6 last:border-b-0"
//             >
//               <Avatar>
//                 <AvatarImage
//                   src={review.user_image_url}
//                   alt={review.user_name}
//                 />
//                 <AvatarFallback>{review.user_name?.charAt(0)}</AvatarFallback>
//               </Avatar>
//               <div className="flex-1">
//                 <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1">
//                   <p className="font-semibold">{review.user_name}</p>
//                   <p className="text-xs text-muted-foreground">
//                     {timeAgo(review.created_at)}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-0.5 mb-2">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={`h-4 w-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
//                     />
//                   ))}
//                 </div>
//                 <p className="text-sm text-muted-foreground">
//                   {review.comment}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-muted-foreground">
//           No reviews yet for this training.
//         </p>
//       )}
//     </div>
//   );
// };

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
