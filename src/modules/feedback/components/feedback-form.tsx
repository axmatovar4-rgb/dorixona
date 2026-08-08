"use client";

import * as React from "react";
import { toast } from "sonner";
import { Star, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitAppFeedback } from "@/modules/feedback/actions";

export function FeedbackForm() {
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await submitAppFeedback({ rating: rating || undefined, message });
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setMessage("");
    setRating(0);
    setSent(true);
    toast.success("Rahmat! Fikringiz yuborildi");
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-8 text-center portal-shadow-sm">
        <p className="font-medium">Rahmat!</p>
        <p className="text-sm text-muted-foreground">Fikringiz uchun rahmat — buni jamoamiz ko&apos;rib chiqadi.</p>
        <Button variant="outline" size="sm" className="mt-2 rounded-full" onClick={() => setSent(false)}>
          Yana fikr qoldirish
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border bg-card p-6 portal-shadow-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Ilovani qanday baholaysiz? (ixtiyoriy)</label>
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
                    "h-7 w-7 transition-colors",
                    starValue <= (hoverRating || rating) ? "fill-primary text-primary" : "fill-muted text-muted"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Fikringiz</label>
        <Textarea
          placeholder="Ilova haqida fikringiz, taklif yoki shikoyatingizni yozing..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={5}
          maxLength={1000}
          rows={5}
          className="rounded-xl"
        />
      </div>
      <Button type="submit" disabled={submitting || message.trim().length < 5} className="w-fit gap-1.5 rounded-full">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Yuborish
      </Button>
    </form>
  );
}
