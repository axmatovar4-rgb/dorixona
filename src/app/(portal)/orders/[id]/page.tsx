import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2, Circle, Pill, MapPin, CreditCard } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageContainer } from "@/modules/customer/components/section";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANT,
  ORDER_STATUS_FLOW,
  PAYMENT_METHOD_LABELS,
} from "@/lib/order-labels";
import { cn } from "@/lib/utils";
import { ReorderButton } from "@/modules/customer/components/reorder-button";

export const metadata: Metadata = { title: "Buyurtma tafsilotlari" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, address: true },
  });
  if (!order || order.customerId !== session!.user.id) notFound();

  const currentStepIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <PageContainer className="flex flex-col gap-6 py-8 sm:py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Buyurtma #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-muted-foreground">{format(order.createdAt, "dd.MM.yyyy HH:mm")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={ORDER_STATUS_VARIANT[order.status]} className="text-sm">
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
          <ReorderButton orderId={order.id} />
        </div>
      </div>

      {!isCancelled && (
        <div className="rounded-2xl border bg-card p-6 portal-shadow-sm">
          <div className="flex items-center justify-between">
            {ORDER_STATUS_FLOW.map((step, i) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      i <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {i <= currentStepIndex ? (
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    ) : (
                      <Circle className="h-4.5 w-4.5" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{ORDER_STATUS_LABELS[step]}</span>
                </div>
                {i < ORDER_STATUS_FLOW.length - 1 && (
                  <div
                    className={cn("mx-1 h-0.5 flex-1 rounded-full", i < currentStepIndex ? "bg-primary" : "bg-muted")}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6 portal-shadow-sm">
        <h2 className="mb-4 font-semibold">Mahsulotlar</h2>
        <div className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/8 to-secondary">
                <Pill className="h-5 w-5 text-primary/30" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-muted-foreground">{item.quantity} × {Number(item.unitPrice).toLocaleString("uz-UZ")} so&apos;m</p>
              </div>
              <span className="font-semibold">{Number(item.lineTotal).toLocaleString("uz-UZ")} so&apos;m</span>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mahsulotlar</span>
            <span>{Number(order.subtotal).toLocaleString("uz-UZ")} so&apos;m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Yetkazib berish</span>
            <span>{Number(order.deliveryFee).toLocaleString("uz-UZ")} so&apos;m</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between text-lg font-bold">
            <span>Jami</span>
            <span>{Number(order.total).toLocaleString("uz-UZ")} so&apos;m</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 portal-shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Manzil
          </h2>
          <p className="font-medium">{order.address.fullAddress}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 portal-shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <CreditCard className="h-4 w-4 text-primary" />
            To&apos;lov usuli
          </h2>
          <p className="font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
        </div>
      </div>

      {order.requiresPrescription && (
        <div className="rounded-2xl border bg-card p-5 portal-shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Retsept</h2>
          <Badge variant={order.prescriptionImageUrl ? "secondary" : "destructive"}>
            {order.prescriptionImageUrl ? "Yuklangan · Tekshirilmoqda" : "Yuklanmagan"}
          </Badge>
        </div>
      )}
    </PageContainer>
  );
}
