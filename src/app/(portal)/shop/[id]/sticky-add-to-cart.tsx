"use client";

import { AddToCart } from "@/modules/customer/components/add-to-cart";

export function StickyAddToCart(props: {
  productId: string;
  name: string;
  unit: string;
  sellPrice: number;
  prescriptionRequired: boolean;
  inStock: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background p-3 sm:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-1">
        <div className="flex-1">
          <p className="text-lg font-bold">
            {props.sellPrice.toLocaleString("uz-UZ")}
            <span className="text-xs font-medium text-muted-foreground"> so&apos;m</span>
          </p>
        </div>
        <div className="flex-[2]">
          <AddToCart {...props} />
        </div>
      </div>
    </div>
  );
}
