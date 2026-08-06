import Link from "next/link";
import { notFound } from "next/navigation";
import { differenceInCalendarDays, format } from "date-fns";
import { Pencil } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BarcodeDisplay } from "@/modules/pharmacy/components/barcode-display";

const MOVEMENT_LABELS: Record<string, string> = {
  IN: "Kirim",
  OUT: "Chiqim",
  TRANSFER_IN: "Transfer (kirim)",
  TRANSFER_OUT: "Transfer (chiqim)",
  ADJUSTMENT: "Tuzatish",
  RETURN: "Qaytarish",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const role = session!.user.role;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, brand: true, manufacturer: true, activeIngredient: true },
  });
  if (!product) notFound();

  const [batches, movements] = await Promise.all([
    prisma.batch.findMany({
      where: { productId: id, quantity: { gt: 0 } },
      include: { warehouse: true },
      orderBy: { expiryDate: "asc" },
    }),
    prisma.stockMovement.findMany({
      where: { productId: id },
      include: { warehouse: true, performedBy: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-sm text-muted-foreground">
            {product.category?.name ?? "Kategoriyasiz"} · {product.brand?.name ?? "Brendsiz"}
          </p>
        </div>
        {can(role, "pharmacy", "edit") && (
          <Link
            href={`/pharmacy/products/${product.id}/edit`}
            className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
          >
            <Pencil className="h-4 w-4" />
            Tahrirlash
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ma&apos;lumotlar</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Field label="Barkod" value={product.barcode} />
            <Field label="Dozalash" value={product.dosage || "—"} />
            <Field label="Birlik" value={product.unit} />
            <Field
              label="Ishlab chiqaruvchi"
              value={product.manufacturer?.name ?? "—"}
            />
            <Field label="Faol modda" value={product.activeIngredient?.name ?? "—"} />
            <Field
              label="Retsept"
              value={product.prescriptionRequired ? "Talab qilinadi" : "Kerak emas"}
            />
            <Field
              label="Xarid narxi"
              value={`${Number(product.purchasePrice).toLocaleString("uz-UZ")} so'm`}
            />
            <Field
              label="Sotuv narxi"
              value={`${Number(product.sellPrice).toLocaleString("uz-UZ")} so'm`}
            />
            <Field label="Strategiya" value={product.stockMethod} />
            <Field label="Min / Maks qoldiq" value={`${product.minStock} / ${product.maxStock}`} />
            <Field
              label="Joriy qoldiq"
              value={
                <Badge variant={totalStock <= product.minStock ? "outline" : "secondary"}>
                  {totalStock} {product.unit}
                </Badge>
              }
            />
            <Field label="Holat" value={product.isActive ? "Faol" : "Nofaol"} />
            {product.description && (
              <div className="col-span-full">
                <span className="text-muted-foreground">Tavsif</span>
                <p className="mt-1">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <BarcodeDisplay
          barcodeValue={product.barcode}
          qrValue={`${process.env.NEXTAUTH_URL}/shop/${product.id}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partiyalar (Batches)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partiya №</TableHead>
                <TableHead>Ombor</TableHead>
                <TableHead>Muddati</TableHead>
                <TableHead>Miqdor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                    Partiyalar mavjud emas
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((b) => {
                  const daysLeft = differenceInCalendarDays(b.expiryDate, new Date());
                  return (
                    <TableRow key={b.id}>
                      <TableCell>{b.batchNumber}</TableCell>
                      <TableCell>{b.warehouse.name}</TableCell>
                      <TableCell>
                        <span
                          className={
                            daysLeft < 0
                              ? "text-destructive"
                              : daysLeft <= 30
                                ? "text-amber-600 dark:text-amber-400"
                                : ""
                          }
                        >
                          {format(b.expiryDate, "dd.MM.yyyy")}
                          {daysLeft < 0
                            ? " (muddati o'tgan)"
                            : daysLeft <= 30
                              ? ` (${daysLeft} kun qoldi)`
                              : ""}
                        </span>
                      </TableCell>
                      <TableCell>{b.quantity}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>So&apos;nggi ombor harakatlari</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sana</TableHead>
                <TableHead>Turi</TableHead>
                <TableHead>Ombor</TableHead>
                <TableHead>Miqdor</TableHead>
                <TableHead>Kim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    Harakatlar mavjud emas
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{format(m.createdAt, "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell>{MOVEMENT_LABELS[m.type] ?? m.type}</TableCell>
                    <TableCell>{m.warehouse.name}</TableCell>
                    <TableCell>{m.quantity}</TableCell>
                    <TableCell>{m.performedBy?.name ?? "Onlayn buyurtma"}</TableCell>
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

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}</span>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
