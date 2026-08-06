import { Leaf, Pill, FlaskConical } from "lucide-react";
import { LogoFull } from "@/components/logo";

export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* soft gradient wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 0%, oklch(0.955 0.06 145 / 70%), transparent 60%), radial-gradient(ellipse 70% 50% at 100% 100%, oklch(0.94 0.05 145 / 60%), transparent 60%)",
        }}
      />

      {/* dotted grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(oklch(0.551 0.171 145.4 / 35%) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* large blurred blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      {/* curved accent lines */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 w-full text-primary/10"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 224 C 240 320 480 128 720 176 C 960 224 1200 96 1440 160 L1440 320 L0 320 Z"
          fill="currentColor"
        />
        <path
          d="M0 260 C 280 200 520 300 760 240 C 1000 180 1220 260 1440 220"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.5"
        />
      </svg>

      {/* floating decorative icons */}
      <Leaf className="pointer-events-none absolute top-[12%] left-[10%] h-10 w-10 -rotate-12 text-primary/25" />
      <Leaf className="pointer-events-none absolute right-[12%] bottom-[18%] h-14 w-14 rotate-45 text-primary/20" />
      <Pill className="pointer-events-none absolute top-[20%] right-[14%] h-9 w-9 rotate-12 text-primary/20" />
      <Pill className="pointer-events-none absolute bottom-[12%] left-[16%] h-8 w-8 -rotate-45 text-primary/25" />
      <FlaskConical className="pointer-events-none absolute top-[8%] right-[30%] h-7 w-7 rotate-6 text-primary/15" />

      <div className="relative z-10 flex w-full flex-col items-center gap-6">
        <LogoFull tagline />
        {children}
      </div>
    </div>
  );
}
