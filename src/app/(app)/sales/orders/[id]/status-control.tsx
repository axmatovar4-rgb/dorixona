"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OrderStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/modules/orders/actions";
import { ORDER_STATUS_LABELS } from "@/lib/order-labels";

export function StatusControl({
  orderId,
  status,
  canEdit,
}: {
  orderId: string;
  status: OrderStatus;
  canEdit: boolean;
}) {
  const router = useRouter();

  if (!canEdit) return null;

  return (
    <Select
      items={Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
      value={status}
      onValueChange={async (v) => {
        const result = await updateOrderStatus(orderId, v as OrderStatus);
        if (result?.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Holat yangilandi");
        router.refresh();
      }}
    >
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
