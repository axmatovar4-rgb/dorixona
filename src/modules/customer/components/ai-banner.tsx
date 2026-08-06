"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAIChat } from "@/modules/customer/ai-chat-context";

export function AIBanner({ compact = false }: { compact?: boolean }) {
  const { openChat } = useAIChat();
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground",
        compact ? "p-5" : "p-8 sm:p-10"
      )}
    >
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex flex-col items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <h3 className={cn("font-bold tracking-tight", compact ? "text-lg" : "text-2xl sm:text-3xl")}>
          AI Sog&apos;liq Yordamchisi
        </h3>
        <p className={cn("max-w-md text-primary-foreground/85", compact ? "text-sm" : "text-base")}>
          Dorilar, ularni saqlash va qo&apos;llash bo&apos;yicha umumiy ma&apos;lumot oling. Tashxis
          qo&apos;ymaydi — faqat maslahat beradi.
        </p>
        <Button
          variant="secondary"
          className="mt-1 gap-1.5 rounded-full bg-white text-primary hover:bg-white/90"
          onClick={openChat}
        >
          Suhbatni boshlash
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
