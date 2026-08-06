"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
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
import { markPurchaseOrdered, receivePurchaseOrder, cancelPurchaseOrder } from "@/modules/procurement/actions";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Qoralama",
  ORDERED: "Buyurtma qilindi",
  RECEIVED: "Qabul qilindi",
  CANCELLED: "Bekor qilindi",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "outline",
  ORDERED: "default",
  RECEIVED: "secondary",
  CANCELLED: "destructive",
};

type PO = {
  id: string;
  status: string;
  createdAt: Date;
  supplier: { name: string };
  warehouse: { name: string };
  items: { quantity: number; unitPrice: unknown }[];
};

export function PurchaseOrderList({ orders, canManage }: { orders: PO[]; canManage: boolean }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function handleAction(fn: (id: string) => Promise<{ error?: string }>, id: string) {
    setPendingId(id);
    const result = await fn(id);
    setPendingId(null);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Bajarildi");
    router.refresh();
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sana</TableHead>
          <TableHead>Yetkazib beruvchi</TableHead>
          <TableHead>Ombor</TableHead>
          <TableHead>Summasi</TableHead>
          <TableHead>Holat</TableHead>
          {canManage && <TableHead className="text-right">Amallar</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
              Xarid buyurtmalari mavjud emas
            </TableCell>
          </TableRow>
        ) : (
          orders.map((po) => {
            const total = po.items.reduce((sum, i) => sum + i.quantity * Number(i.unitPrice), 0);
            return (
              <TableRow key={po.id}>
                <TableCell>{format(po.createdAt, "dd.MM.yyyy")}</TableCell>
                <TableCell>{po.supplier.name}</TableCell>
                <TableCell>{po.warehouse.name}</TableCell>
                <TableCell>{total.toLocaleString("uz-UZ")} so&apos;m</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[po.status]}>{STATUS_LABELS[po.status]}</Badge>
                </TableCell>
                {canManage && (
                  <TableCell className="flex justify-end gap-2">
                    {po.status === "DRAFT" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pendingId === po.id}
                          onClick={() => handleAction(markPurchaseOrdered, po.id)}
                        >
                          {pendingId === po.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Buyurtma qilish"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={pendingId === po.id}
                          onClick={() => handleAction(cancelPurchaseOrder, po.id)}
                        >
                          Bekor qilish
                        </Button>
                      </>
                    )}
                    {po.status === "ORDERED" && (
                      <Button
                        size="sm"
                        disabled={pendingId === po.id}
                        onClick={() => handleAction(receivePurchaseOrder, po.id)}
                      >
                        {pendingId === po.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Qabul qilish"}
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
