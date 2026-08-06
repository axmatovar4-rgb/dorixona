"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/modules/customer/cart-context";
import { DELIVERY_FEE } from "@/modules/customer/constants";
import { PageContainer } from "@/modules/customer/components/section";

export default function CartPage() {
  const router = useRouter();
  const { items, setQuantity, removeItem, subtotal, requiresPrescription } = useCart();

  React.useEffect(() => {
    document.title = "Savat — PharmCare";
  }, []);

  if (items.length === 0) {
    return (
      <PageContainer className="flex flex-col items-center justify-center gap-4 py-28 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
          <ShoppingBag className="h-9 w-9 text-primary" />
        </div>
        <div>
          <p className="text-xl font-semibold">Savatingiz bo&apos;sh</p>
          <p className="mt-1 text-muted-foreground">Kerakli dorilarni qidirib, savatga qo&apos;shing</p>
        </div>
        <Button className="gap-1.5 rounded-full" render={<Link href="/shop" />}>
          Do&apos;konga o&apos;tish
          <ArrowRight className="h-4 w-4" />
        </Button>
      </PageContainer>
    );
  }

  const total = subtotal + DELIVERY_FEE;

  return (
    <PageContainer className="py-8 sm:py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Savat</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-2xl border bg-card p-4 portal-shadow-sm"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/8 to-secondary">
                <Pill className="h-7 w-7 text-primary/30" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.sellPrice.toLocaleString("uz-UZ")} so&apos;m / {item.unit}
                </p>
                {item.prescriptionRequired && (
                  <Badge variant="outline" className="mt-1.5">
                    Retsept talab qilinadi
                  </Badge>
                )}
              </div>
              <div className="flex items-center rounded-full border bg-muted/40">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="hidden w-28 text-right font-semibold sm:block">
                {(item.sellPrice * item.quantity).toLocaleString("uz-UZ")} so&apos;m
              </p>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.productId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border bg-card p-6 portal-shadow-sm lg:sticky lg:top-24">
          <h2 className="mb-4 font-semibold">Buyurtma xulosasi</h2>
          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mahsulotlar summasi</span>
              <span>{subtotal.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Yetkazib berish</span>
              <span>{DELIVERY_FEE.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-lg font-bold">
              <span>Jami</span>
              <span>{total.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>
          </div>
          {requiresPrescription && (
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
              Savatda retsept talab qilinadigan dori bor — buyurtma berishda retsept rasmini
              yuklashingiz kerak bo&apos;ladi.
            </p>
          )}
          <Button className="mt-5 h-12 w-full gap-1.5 rounded-full text-base" onClick={() => router.push("/checkout")}>
            Buyurtma berish
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
