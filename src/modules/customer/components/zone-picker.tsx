"use client";

import { Check, MapPinned } from "lucide-react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type ZoneOption = { id: string; name: string; fee: number };

export function ZonePicker({
  zones,
  value,
  onChange,
}: {
  zones: ZoneOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <Command className="rounded-2xl border" shouldFilter>
      <CommandInput placeholder="Shahar yoki tuman bo'yicha qidiring..." />
      <CommandList className="max-h-64">
        <CommandEmpty>Hech narsa topilmadi</CommandEmpty>
        {zones.map((z) => (
          <CommandItem
            key={z.id}
            value={z.name}
            onSelect={() => onChange(z.id)}
            className={cn(
              "flex items-center justify-between gap-2 !py-2.5",
              value === z.id && "bg-primary/10 text-primary"
            )}
          >
            <span className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 shrink-0" />
              {z.name}
            </span>
            <span className="flex shrink-0 items-center gap-2 text-sm font-medium">
              {z.fee.toLocaleString("uz-UZ")} so&apos;m
              {value === z.id && <Check className="h-4 w-4" />}
            </span>
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );
}
