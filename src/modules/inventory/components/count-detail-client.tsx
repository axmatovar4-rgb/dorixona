"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { submitCountItem, completeInventoryCount } from "@/modules/inventory/actions";

type Item = {
  id: string;
  productName: string;
  batchNumber: string;
  systemQty: number;
  countedQty: number | null;
  diff: number | null;
};

export function CountDetailClient({
  countId,
  items,
  isCompleted,
  canEdit,
}: {
  countId: string;
  items: Item[];
  isCompleted: boolean;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = React.useState<Record<string, string>>(
    Object.fromEntries(items.map((i) => [i.id, i.countedQty?.toString() ?? ""]))
  );
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [completing, setCompleting] = React.useState(false);

  async function handleSave(itemId: string) {
    const raw = values[itemId];
    const qty = Number(raw);
    if (raw === "" || Number.isNaN(qty) || qty < 0) {
      toast.error("To'g'ri son kiriting");
      return;
    }
    setSavingId(itemId);
    const result = await submitCountItem(itemId, qty);
    setSavingId(null);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleComplete() {
    setCompleting(true);
    const result = await completeInventoryCount(countId);
    setCompleting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Inventarizatsiya yakunlandi, tafovutlar tizimga qo'llandi");
    router.refresh();
  }

  const allCounted = items.every((i) => values[i.id] !== "" && values[i.id] !== undefined);

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mahsulot</TableHead>
            <TableHead>Partiya</TableHead>
            <TableHead>Tizimdagi qoldiq</TableHead>
            <TableHead>Haqiqiy qoldiq</TableHead>
            <TableHead>Farq</TableHead>
            {canEdit && !isCompleted && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const diff =
              values[item.id] !== "" && !Number.isNaN(Number(values[item.id]))
                ? Number(values[item.id]) - item.systemQty
                : null;
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.productName}</TableCell>
                <TableCell>{item.batchNumber}</TableCell>
                <TableCell>{item.systemQty}</TableCell>
                <TableCell>
                  {isCompleted || !canEdit ? (
                    item.countedQty ?? "—"
                  ) : (
                    <Input
                      type="number"
                      className="w-24"
                      value={values[item.id] ?? ""}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, [item.id]: e.target.value }))
                      }
                    />
                  )}
                </TableCell>
                <TableCell>
                  {diff !== null && (
                    <Badge variant={diff === 0 ? "secondary" : "outline"}>
                      {diff > 0 ? `+${diff}` : diff}
                    </Badge>
                  )}
                </TableCell>
                {canEdit && !isCompleted && (
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingId === item.id}
                      onClick={() => handleSave(item.id)}
                    >
                      {savingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Saqlash"
                      )}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {canEdit && !isCompleted && (
        <div className="flex justify-end">
          <Button onClick={handleComplete} disabled={!allCounted || completing} className="gap-1.5">
            {completing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Inventarizatsiyani yakunlash
          </Button>
        </div>
      )}
    </div>
  );
}
