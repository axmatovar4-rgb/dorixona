import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Package,
  MapPin,
  FileText,
  ChevronRight,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageContainer } from "@/modules/customer/components/section";
import { StatCard } from "@/modules/customer/components/stat-card";
import { AIBanner } from "@/modules/customer/components/ai-banner";
import { ProfileForm } from "@/modules/customer/components/profile-form";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANT } from "@/lib/order-labels";
import { checkExpiryForCustomer } from "@/lib/expiry-check";

export default async function AccountPage() {
  const session = await auth();
  await checkExpiryForCustomer(session!.user.id);
  const [customer, orders, addresses] = await Promise.all([
    prisma.customer.findUnique({ where: { id: session!.user.id } }),
    prisma.order.findMany({
      where: { customerId: session!.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.address.findMany({
      where: { customerId: session!.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);
  if (!customer) notFound();

  const activeOrders = orders.filter((o) => o.status === "PENDING" || o.status === "PREPARING" || o.status === "DELIVERING");
  const prescriptionOrders = orders.filter((o) => o.requiresPrescription);
  const initials = `${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase();

  return (
    <PageContainer className="flex flex-col gap-10 py-8 sm:py-12">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-muted-foreground">{customer.phone}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Jami buyurtmalar" value={orders.length} />
        <StatCard icon={Clock} label="Faol buyurtmalar" value={activeOrders.length} />
        <StatCard icon={FileText} label="Retseptli buyurtmalar" value={prescriptionOrders.length} />
        <StatCard icon={MapPin} label="Saqlangan manzillar" value={addresses.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-2xl border bg-card p-6 portal-shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Package className="h-4 w-4 text-primary" />
                So&apos;nggi buyurtmalar
              </h2>
              <Link href="/orders" className="flex items-center text-sm font-medium text-primary hover:underline">
                Barchasi <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Hali buyurtmalar yo&apos;q</p>
            ) : (
              <div className="flex flex-col gap-2">
                {orders.slice(0, 4).map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted/60"
                  >
                    <div>
                      <p className="font-medium">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{format(order.createdAt, "dd.MM.yyyy")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{Number(order.total).toLocaleString("uz-UZ")} so&apos;m</span>
                      <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {prescriptionOrders.length > 0 && (
            <div className="rounded-2xl border bg-card p-6 portal-shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                Retsept holati
              </h2>
              <div className="flex flex-col gap-2">
                {prescriptionOrders.slice(0, 4).map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted/60"
                  >
                    <span>#{order.id.slice(-8).toUpperCase()}</span>
                    <Badge variant={order.prescriptionImageUrl ? "secondary" : "destructive"}>
                      {order.prescriptionImageUrl ? "Tekshirilmoqda" : "Yuklanmagan"}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border bg-card p-6 portal-shadow-sm">
            <h2 className="mb-4 font-semibold">Shaxsiy ma&apos;lumotlar</h2>
            <ProfileForm
              defaultValues={{
                firstName: customer.firstName,
                lastName: customer.lastName,
                address: customer.address ?? "",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border bg-card p-6 portal-shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4 text-primary" />
                Manzillarim
              </h2>
              <Link href="/account/addresses" className="text-sm font-medium text-primary hover:underline">
                Boshqarish
              </Link>
            </div>
            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Hali manzil qo&apos;shilmagan</p>
            ) : (
              <div className="flex flex-col gap-2">
                {addresses.slice(0, 2).map((addr) => (
                  <div key={addr.id} className="rounded-xl bg-muted/50 p-3 text-sm">
                    {addr.label && <span className="font-medium">{addr.label}: </span>}
                    {addr.fullAddress}
                  </div>
                ))}
              </div>
            )}
          </div>

          <AIBanner compact />
        </div>
      </div>
    </PageContainer>
  );
}
