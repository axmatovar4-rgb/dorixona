"use client";

import * as React from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/modules/customer/cart-context";

export function AddToCart({
  productId,
  name,
  unit,
  sellPrice,
  prescriptionRequired,
  inStock,
  size = "default",
}: {
  productId: string;
  name: string;
  unit: string;
  sellPrice: number;
  prescriptionRequired: boolean;
  inStock: boolean;
  size?: "default" | "lg";
}) {
  const [qty, setQty] = React.useState(1);
  const { addItem } = useCart();

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center rounded-full border bg-muted/40 ${size === "lg" ? "h-12" : "h-10"}`}>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">{qty}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          onClick={() => setQty((q) => q + 1)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Button
        className={`flex-1 gap-1.5 rounded-full ${size === "lg" ? "h-12 text-base" : ""}`}
        disabled={!inStock}
        onClick={() => {
          addItem({ productId, name, unit, sellPrice, prescriptionRequired }, qty);
          toast.success(`${name} (${qty} ${unit}) savatga qo'shildi`);
          setQty(1);
        }}
      >
        <ShoppingBag className="h-4 w-4" />
        {inStock ? "Savatga qo'shish" : "Mavjud emas"}
      </Button>
    </div>
  );
}
