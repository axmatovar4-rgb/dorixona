"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Truck, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HIGHLIGHTS = [
  { icon: Truck, label: "Tezkor yetkazib berish" },
  { icon: ShieldCheck, label: "Original dorilar" },
  { icon: Clock, label: "24/7 buyurtma qabul" },
];

export function Hero() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}#catalog` : "/shop#catalog");
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-transparent">
      <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-primary portal-shadow-sm">
          Sog&apos;ligingiz uchun ishonchli hamroh
        </span>
        <h1 className="text-4xl leading-tight font-bold tracking-tight text-balance sm:text-6xl">
          Dorilaringizni <span className="text-primary">bir necha bosishda</span> buyurtma bering
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Minglab dorilar, tezkor yetkazib berish va ishonchli sifat — barchasi PharmCare&apos;da.
        </p>

        <form onSubmit={handleSearch} className="mt-2 w-full max-w-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Dori nomini yozing, masalan: Parasetamol"
              className="h-14 rounded-full border-transparent bg-background pl-13 pr-32 text-base portal-shadow focus-visible:border-ring"
            />
            <Button type="submit" className="absolute top-1/2 right-1.5 h-11 -translate-y-1/2 rounded-full px-6">
              Qidirish
            </Button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <h.icon className="h-4 w-4 text-primary" />
              {h.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
