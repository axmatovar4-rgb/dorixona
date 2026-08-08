"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Star, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitReview } from "@/modules/reviews/actions";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  customerName: string;
};

export function ProductReviews({
  productId,
  reviews,
  canReview,
  myReview,
}: {
  productId: string;
  reviews: Review[];
  canReview: boolean;
  myReview: { rating: number; comment: string | null } | null;
}) {
  const router = useRouter();
  const [rating, setRating] = React.useState(myReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [comment, setComment] = React.useState(myReview?.comment ?? "");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit() {
    if (rating < 1) {
      toast.error("Baho tanlang");
      return;
    }
    setSubmitting(true);
    const result = await submitReview({ productId, rating, comment });
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(myReview ? "Bahoyingiz yangilandi" : "Rahmat, bahoyingiz qo'shildi!");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {canReview && (
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 portal-shadow-sm">
          <p className="text-sm font-medium">{myReview ? "Bahoyingizni tahrirlang" : "Bahoyingizni qoldiring"}</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const starValue = i + 1;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      starValue <= (hoverRating || rating)
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted"
                    )}
                  />
                </button>
              );
            })}
          </div>
          <Textarea
            placeholder="Fikringizni yozing (ixtiyoriy)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={2}
            className="rounded-xl"
          />
          <Button onClick={handleSubmit} disabled={submitting} className="w-fit gap-1.5 rounded-full">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {myReview ? "Yangilash" : "Yuborish"}
          </Button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">Hali fikr qoldirilmagan</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border bg-card p-4 portal-shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-medium">{r.customerName}</span>
                </div>
                <span className="text-xs text-muted-foreground">{format(r.createdAt, "dd.MM.yyyy")}</span>
              </div>
              <div className="mt-2 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn("h-3.5 w-3.5", i < r.rating ? "fill-primary text-primary" : "fill-muted text-muted")}
                  />
                ))}
              </div>
              {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
