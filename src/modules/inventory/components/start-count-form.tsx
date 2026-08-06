"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startInventoryCount } from "@/modules/inventory/actions";

type Option = { id: string; name: string };

export function StartCountForm({ warehouses }: { warehouses: Option[] }) {
  const router = useRouter();
  const [warehouseId, setWarehouseId] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function handleStart() {
    if (!warehouseId) {
      toast.error("Omborni tanlang");
      return;
    }
    setPending(true);
    const result = await startInventoryCount(warehouseId);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Inventarizatsiya boshlandi");
    router.push(`/inventory/counts/${result!.id}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Ombor</label>
        <Select
          items={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          value={warehouseId}
          onValueChange={(v) => setWarehouseId(v ?? "")}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Omborni tanlang" />
          </SelectTrigger>
          <SelectContent>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleStart} disabled={pending} className="gap-1.5">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
        Yangi inventarizatsiya boshlash
      </Button>
    </div>
  );
}
