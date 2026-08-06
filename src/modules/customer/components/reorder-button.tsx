"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reorderItems } from "@/modules/customer/actions";
import { useCart } from "@/modules/customer/cart-context";

export function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { addItems } = useCart();
  const [pending, setPending] = React.useState(false);

  async function handleClick() {
    setPending(true);
    const result = await reorderItems(orderId);
    setPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    addItems(result.items);
    if (result.skipped.length > 0) {
      toast.warning(`Savatga qo'shildi. Mavjud emas: ${result.skipped.join(", ")}`);
    } else {
      toast.success("Mahsulotlar savatga qo'shildi");
    }
    router.push("/cart");
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={handleClick}
      className="gap-1.5 rounded-full"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
      Yana buyurtma berish
    </Button>
  );
}
