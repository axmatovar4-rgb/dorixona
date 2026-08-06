import type { Metadata } from "next";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransferForm } from "@/modules/inventory/components/transfer-form";

export const metadata: Metadata = { title: "Transferlar" };

export default async function TransfersPage() {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "create")) {
    redirect("/inventory/alerts");
  }

  const [products, warehouses, transfers] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.warehouse.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.stockTransfer.findMany({
      include: { product: true, fromWarehouse: true, toWarehouse: true, createdBy: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transferlar</h1>
        <p className="text-sm text-muted-foreground">
          Omborlar orasida mahsulot ko&apos;chirish
        </p>
      </div>

      <TransferForm products={products} warehouses={warehouses} />

      <Card>
        <CardHeader>
          <CardTitle>So&apos;nggi transferlar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sana</TableHead>
                <TableHead>Mahsulot</TableHead>
                <TableHead>Qayerdan</TableHead>
                <TableHead>Qayerga</TableHead>
                <TableHead>Miqdor</TableHead>
                <TableHead>Holat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                    Transferlar mavjud emas
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{format(t.createdAt, "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell>{t.product.name}</TableCell>
                    <TableCell>{t.fromWarehouse.name}</TableCell>
                    <TableCell>{t.toWarehouse.name}</TableCell>
                    <TableCell>{t.quantity}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === "COMPLETED" ? "secondary" : "outline"}>
                        {t.status}
                      </Badge>
                    </TableCell>
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
