import Link from "next/link";
import { format } from "date-fns";
import { Package, ArrowRight, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/modules/customer/components/section";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANT } from "@/lib/order-labels";
import { checkExpiryForCustomer } from "@/lib/expiry-check";

export default async function OrdersPage() {
  const session = await auth();
  await checkExpiryForCustomer(session!.user.id);
  const orders = await prisma.order.findMany({
    where: { customerId: session!.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <PageContainer className="flex flex-col items-center justify-center gap-4 py-28 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
          <Package className="h-9 w-9 text-primary" />
        </div>
        <div>
          <p className="text-xl font-semibold">Hali buyurtmalaringiz yo&apos;q</p>
          <p className="mt-1 text-muted-foreground">Do&apos;kondan kerakli dorilarni tanlang</p>
        </div>
        <Button className="gap-1.5 rounded-full" render={<Link href="/shop" />}>
          Do&apos;konga o&apos;tish
          <ArrowRight className="h-4 w-4" />
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 sm:py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Buyurtmalarim</h1>
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 portal-shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:portal-shadow">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(order.createdAt, "dd.MM.yyyy HH:mm")} · {order.items.length} ta mahsulot
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden font-semibold sm:inline">
                  {Number(order.total).toLocaleString("uz-UZ")} so&apos;m
                </span>
                <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
