import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { startOfMonth, subMonths, addDays } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Hisobotlar" };

export default async function ReportsPage() {
  const session = await auth();
  if (!(await canAsync(session?.user.role, "reports", "view"))) redirect("/dashboard");

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const in30Days = addDays(now, 30);

  const [
    revenueThisMonth,
    revenueLastMonth,
    ordersThisMonth,
    topProductsRaw,
    batches,
    lowStockProducts,
    nearExpiryCount,
    expiredCount,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: thisMonthStart }, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart }, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: thisMonthStart }, status: { not: "CANCELLED" } } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.batch.findMany({ select: { quantity: true, purchasePrice: true } }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { batches: { select: { quantity: true } } },
    }),
    prisma.batch.count({ where: { expiryDate: { gte: now, lte: in30Days }, quantity: { gt: 0 } } }),
    prisma.batch.count({ where: { expiryDate: { lt: now }, quantity: { gt: 0 } } }),
  ]);

  const topProducts = await Promise.all(
    topProductsRaw.map(async (tp) => {
      const product = await prisma.product.findUnique({ where: { id: tp.productId }, select: { name: true } });
      return { name: product?.name ?? "—", quantity: tp._sum.quantity ?? 0 };
    })
  );

  const inventoryValue = batches.reduce((sum, b) => sum + b.quantity * Number(b.purchasePrice), 0);
  const lowStockCount = lowStockProducts.filter(
    (p) => p.batches.reduce((s, b) => s + b.quantity, 0) <= p.minStock
  ).length;

  const revThis = Number(revenueThisMonth._sum.total ?? 0);
  const revLast = Number(revenueLastMonth._sum.total ?? 0);
  const growth = revLast > 0 ? ((revThis - revLast) / revLast) * 100 : revThis > 0 ? 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hisobotlar va tahlil</h1>
        <p className="text-muted-foreground">Savdo, ombor va moliyaviy ko&apos;rsatkichlar</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shu oy tushum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{revThis.toLocaleString("uz-UZ")} so&apos;m</p>
            <p className={`text-xs ${growth >= 0 ? "text-emerald-600" : "text-destructive"}`}>
              {growth >= 0 ? "+" : ""}
              {growth.toFixed(1)}% o&apos;tgan oyga nisbatan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shu oy buyurtmalar</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{ordersThisMonth}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ombor qiymati</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{inventoryValue.toLocaleString("uz-UZ")} so&apos;m</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kam qolgan / Muddati yaqin</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {lowStockCount} / {nearExpiryCount}
            <span className="ml-2 text-xs font-normal text-destructive">{expiredCount} muddati o&apos;tgan</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eng ko&apos;p sotilgan 5 ta mahsulot</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahsulot</TableHead>
                <TableHead className="text-right">Sotilgan miqdor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-16 text-center text-muted-foreground">
                    Ma&apos;lumot yo&apos;q
                  </TableCell>
                </TableRow>
              ) : (
                topProducts.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">{p.quantity}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
