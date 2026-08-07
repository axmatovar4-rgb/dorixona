"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Pill, ShoppingBag, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/modules/customer/cart-context";
import { RatingStars } from "@/modules/customer/components/rating-stars";
import { derivedRating } from "@/modules/customer/rating";
import { cn } from "@/lib/utils";

export type MedicineCardData = {
  id: string;
  name: string;
  unit: string;
  dosage?: string | null;
  sellPrice: string | number;
  oldPrice?: string | number | null;
  prescriptionRequired: boolean;
  imageUrl?: string | null;
  category?: string | null;
  brand?: string | null;
  inStock: boolean;
};

export function MedicineCard({
  product,
  className,
}: {
  product: MedicineCardData;
  className?: string;
}) {
  const { addItem } = useCart();
  const price = Number(product.sellPrice);
  const oldPrice = product.oldPrice != null ? Number(product.oldPrice) : null;
  const hasDiscount = oldPrice != null && oldPrice > price;
  const discountPercent = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const rating = derivedRating(product.id);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card portal-shadow-sm transition-all duration-300 hover:-translate-y-1 hover:portal-shadow",
        className
      )}
    >
      <Link href={`/shop/${product.id}`} className="relative block aspect-square overflow-hidden bg-gradient-to-br from-primary/8 via-accent to-secondary">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary external product image URL
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Pill className="h-14 w-14 text-primary/25 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          <div className="flex flex-col gap-1">
            {hasDiscount && (
              <Badge className="border-0 bg-red-600 text-white">-{discountPercent}%</Badge>
            )}
            {product.prescriptionRequired && (
              <Badge className="border-0 bg-foreground/80 text-background backdrop-blur-sm">Retsept</Badge>
            )}
          </div>
          {!product.inStock && (
            <Badge variant="destructive" className="border-0">
              Tugagan
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-medium text-muted-foreground">
          {product.brand ?? product.category ?? "PharmCare"}
        </p>
        <Link href={`/shop/${product.id}`} className="line-clamp-2 min-h-10 font-semibold leading-tight hover:text-primary">
          {product.name}
          {product.dosage ? ` · ${product.dosage}` : ""}
        </Link>
        <RatingStars value={rating} />
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
          <p
            className={cn(
              "text-xl font-bold tracking-tight",
              hasDiscount && "text-red-600 dark:text-red-400"
            )}
          >
            {price.toLocaleString("uz-UZ")}
            <span className="text-sm font-medium text-muted-foreground"> so&apos;m</span>
          </p>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {oldPrice.toLocaleString("uz-UZ")}
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 rounded-full"
            render={<Link href={`/shop/${product.id}`} />}
          >
            <Eye className="h-3.5 w-3.5" />
            Ko&apos;rish
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1.5 rounded-full"
            disabled={!product.inStock}
            onClick={() => {
              addItem({
                productId: product.id,
                name: product.name,
                unit: product.unit,
                sellPrice: price,
                prescriptionRequired: product.prescriptionRequired,
              });
              toast.success(`${product.name} savatga qo'shildi`);
            }}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Savatga
          </Button>
        </div>
      </div>
    </div>
  );
}
