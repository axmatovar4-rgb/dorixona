import type { Metadata } from "next";
import Link from "next/link";
import { addDays } from "date-fns";
import {
  Package,
  AlertTriangle,
  CalendarClock,
  CalendarX2,
  Wallet,
  Warehouse,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/role-labels";
import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";

export const metadata: Metadata = { title: "Boshqaruv paneli" };

export default async function DashboardPage() {
  const session = await auth();
  const role = session!.user.role;
  const canManagePharmacy = can(role, "pharmacy", "create");
  const canManageInventory = can(role, "inventory", "create");
  const now = new Date();
  const in30Days = addDays(now, 30);

  const [products, batches, warehouseCount, lowStockCount, nearExpiryCount, expiredCount] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.batch.findMany({
        where: { quantity: { gt: 0 } },
        select: { quantity: true, purchasePrice: true },
      }),
      prisma.warehouse.count({ where: { isActive: true } }),
      prisma.product
        .findMany({
          where: { isActive: true },
          select: { minStock: true, batches: { select: { quantity: true } } },
        })
        .then(
          (list) =>
            list.filter(
              (p) => p.batches.reduce((s, b) => s + b.quantity, 0) <= p.minStock
            ).length
        ),
      prisma.batch.count({
        where: { expiryDate: { gte: now, lte: in30Days }, quantity: { gt: 0 } },
      }),
      prisma.batch.count({
        where: { expiryDate: { lt: now }, quantity: { gt: 0 } },
      }),
    ]);

  const totalStockValue = batches.reduce(
    (sum, b) => sum + b.quantity * Number(b.purchasePrice),
    0
  );

  const cards = [
    {
      title: "Faol mahsulotlar",
      value: products,
      icon: Package,
      href: "/pharmacy/products",
      variant: "default" as const,
    },
    {
      title: "Omborlar",
      value: warehouseCount,
      icon: Warehouse,
      href: "/inventory/warehouses",
      variant: "default" as const,
    },
    {
      title: "Kam qolgan mahsulotlar",
      value: lowStockCount,
      icon: AlertTriangle,
      href: "/inventory/alerts",
      variant: lowStockCount > 0 ? "warning" : "default",
    },
    {
      title: "Muddati yaqin (30 kun)",
      value: nearExpiryCount,
      icon: CalendarClock,
      href: "/inventory/alerts",
      variant: nearExpiryCount > 0 ? "warning" : "default",
    },
    {
      title: "Muddati o'tgan",
      value: expiredCount,
      icon: CalendarX2,
      href: "/inventory/alerts",
      variant: expiredCount > 0 ? "destructive" : "default",
    },
    {
      title: "Ombordagi umumiy qiymat",
      value: `${totalStockValue.toLocaleString("uz-UZ")} so'm`,
      icon: Wallet,
      href: "/inventory/movements",
      variant: "default" as const,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Xush kelibsiz{session?.user?.name ? `, ${session.user.name}` : ""} ·{" "}
          {session?.user?.role && ROLE_LABELS[session.user.role]}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <Icon
                    className={
                      card.variant === "destructive"
                        ? "h-4 w-4 text-destructive"
                        : card.variant === "warning"
                          ? "h-4 w-4 text-amber-500"
                          : "h-4 w-4 text-muted-foreground"
                    }
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{card.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {(canManagePharmacy || canManageInventory) && (
        <Card>
          <CardHeader>
            <CardTitle>Tezkor havolalar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2 text-sm">
            {[
              canManagePharmacy && (
                <Link key="new-product" href="/pharmacy/products/new" className="text-primary hover:underline">
                  + Yangi dori qo&apos;shish
                </Link>
              ),
              canManageInventory && (
                <Link key="stock-in" href="/inventory/stock-in" className="text-primary hover:underline">
                  Kirim kiritish
                </Link>
              ),
              canManageInventory && (
                <Link key="stock-out" href="/inventory/stock-out" className="text-primary hover:underline">
                  Chiqim kiritish
                </Link>
              ),
              canManageInventory && (
                <Link key="counts" href="/inventory/counts" className="text-primary hover:underline">
                  Inventarizatsiya boshlash
                </Link>
              ),
            ]
              .filter(Boolean)
              .map((link, i, arr) => (
                <span key={i} className="flex items-center gap-2">
                  {link}
                  {i < arr.length - 1 && <span className="text-muted-foreground">·</span>}
                </span>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
