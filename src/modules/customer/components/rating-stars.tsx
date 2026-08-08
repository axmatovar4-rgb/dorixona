import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  if (count === 0) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-muted-foreground/15 text-muted-foreground" />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Hali baho yo&apos;q</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < Math.round(value)
                ? "fill-primary text-primary"
                : "fill-muted-foreground/15 text-muted-foreground"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {value.toFixed(1)}
        {count != null && ` (${count})`}
      </span>
    </div>
  );
}
