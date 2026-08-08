"use client";

import { Check, MapPin, Store } from "lucide-react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type BranchOption = {
  id: string;
  name: string;
  region: string | null;
  address: string | null;
};

export function BranchPicker({
  branches,
  value,
  onChange,
}: {
  branches: BranchOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (branches.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
        Hozircha filiallar qo&apos;shilmagan
      </p>
    );
  }

  return (
    <Command className="rounded-2xl border" shouldFilter>
      <CommandInput placeholder="Shahar yoki tuman bo'yicha qidiring..." />
      <CommandList className="max-h-64">
        <CommandEmpty>Hech narsa topilmadi</CommandEmpty>
        {branches.map((b) => (
          <CommandItem
            key={b.id}
            value={`${b.name} ${b.region ?? ""} ${b.address ?? ""}`}
            onSelect={() => onChange(b.id)}
            className={cn(
              "flex items-start gap-2.5 !py-2.5",
              value === b.id && "bg-primary/10 text-primary"
            )}
          >
            <Store className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">
              <span className="block font-medium">{b.name}</span>
              {(b.region || b.address) && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {[b.region, b.address].filter(Boolean).join(" — ")}
                </span>
              )}
            </span>
            {value === b.id && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );
}
