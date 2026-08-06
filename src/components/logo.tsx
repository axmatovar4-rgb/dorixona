import { Pill, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10",
        className
      )}
    >
      <Pill className="h-[52%] w-[52%] -rotate-45 text-primary" strokeWidth={2.25} />
      <Leaf className="absolute -top-0.5 -right-0.5 h-[42%] w-[42%] fill-primary/25 text-primary" strokeWidth={2} />
    </div>
  );
}

export function LogoFull({
  className,
  tagline = false,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-10 w-10" />
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-extrabold tracking-tight text-foreground">
          PHARM <span className="text-primary">CARE</span>
        </span>
        {tagline && (
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Sizning salomatligingiz — bizning g&apos;amxo&apos;rligimiz
          </span>
        )}
      </div>
    </div>
  );
}
