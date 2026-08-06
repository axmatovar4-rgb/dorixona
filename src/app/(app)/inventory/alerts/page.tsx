import type { Metadata } from "next";
import Link from "next/link";
import { format, addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
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

export const metadata: Metadata = { title: "Ogohlantirishlar" };

export default async function AlertsPage() {
  const now = new Date();
  const in30Days = addDays(now, 30);

  const [products, nearExpiryBatches, expiredBatches] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { batches: { select: { quantity: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.batch.findMany({
      where: { expiryDate: { gte: now, lte: in30Days }, quantity: { gt: 0 } },
      include: { product: true, warehouse: true },
      orderBy: { expiryDate: "asc" },
    }),
    prisma.batch.findMany({
      where: { expiryDate: { lt: now }, quantity: { gt: 0 } },
      include: { product: true, warehouse: true },
      orderBy: { expiryDate: "asc" },
    }),
  ]);

  const lowStockProducts = products
    .map((p) => ({
      ...p,
      currentStock: p.batches.reduce((sum, b) => sum + b.quantity, 0),
    }))
    .filter((p) => p.currentStock <= p.minStock);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ogohlantirishlar</h1>
        <p className="text-sm text-muted-foreground">
          Kam qolgan, muddati yaqin va muddati o&apos;tgan mahsulotlar
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Kam qolgan mahsulotlar
            <Badge variant="outline">{lowStockProducts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahsulot</TableHead>
                <TableHead>Joriy qoldiq</TableHead>
                <TableHead>Minimal qoldiq</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-16 text-center text-muted-foreground">
                    Hammasi yaxshi, kam qolgan mahsulot yo&apos;q
                  </TableCell>
                </TableRow>
              ) : (
                lowStockProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/pharmacy/products/${p.id}`} className="font-medium hover:underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.currentStock === 0 ? "destructive" : "outline"}>
                        {p.currentStock} {p.unit}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.minStock}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Muddati yaqin (30 kun ichida)
            <Badge variant="outline">{nearExpiryBatches.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahsulot</TableHead>
                <TableHead>Partiya</TableHead>
                <TableHead>Ombor</TableHead>
                <TableHead>Muddati</TableHead>
                <TableHead>Miqdor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nearExpiryBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                    Muddati yaqinlashgan partiyalar yo&apos;q
                  </TableCell>
                </TableRow>
              ) : (
                nearExpiryBatches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Link href={`/pharmacy/products/${b.productId}`} className="font-medium hover:underline">
                        {b.product.name}
                      </Link>
                    </TableCell>
                    <TableCell>{b.batchNumber}</TableCell>
                    <TableCell>{b.warehouse.name}</TableCell>
                    <TableCell className="text-amber-600 dark:text-amber-400">
                      {format(b.expiryDate, "dd.MM.yyyy")}
                    </TableCell>
                    <TableCell>{b.quantity}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Muddati o&apos;tgan
            <Badge variant="destructive">{expiredBatches.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahsulot</TableHead>
                <TableHead>Partiya</TableHead>
                <TableHead>Ombor</TableHead>
                <TableHead>Muddati</TableHead>
                <TableHead>Miqdor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                    Muddati o&apos;tgan partiyalar yo&apos;q
                  </TableCell>
                </TableRow>
              ) : (
                expiredBatches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Link href={`/pharmacy/products/${b.productId}`} className="font-medium hover:underline">
                        {b.product.name}
                      </Link>
                    </TableCell>
                    <TableCell>{b.batchNumber}</TableCell>
                    <TableCell>{b.warehouse.name}</TableCell>
                    <TableCell className="text-destructive">{format(b.expiryDate, "dd.MM.yyyy")}</TableCell>
                    <TableCell>{b.quantity}</TableCell>
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
