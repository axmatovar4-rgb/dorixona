"use client";

import { cn } from "@/lib/utils";

export function Marquee({
  children,
  className,
  durationSeconds = 30,
  reverse = false,
}: {
  children: React.ReactNode;
  className?: string;
  durationSeconds?: number;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]",
        className
      )}
    >
      <div
        className={cn(
          "flex w-max shrink-0 items-stretch gap-4 group-hover:[animation-play-state:paused]",
          reverse ? "animate-marquee [animation-direction:reverse]" : "animate-marquee"
        )}
        style={{ "--marquee-duration": `${durationSeconds}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-stretch gap-4">{children}</div>
        <div aria-hidden="true" className="flex shrink-0 items-stretch gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}
