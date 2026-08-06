import type { Metadata } from "next";
import Link from "next/link";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StartCountForm } from "@/modules/inventory/components/start-count-form";

export const metadata: Metadata = { title: "Inventarizatsiya" };

export default async function CountsPage() {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "view")) {
    redirect("/dashboard");
  }
  const canManage = can(session.user.role, "inventory", "create");

  const [warehouses, counts] = await Promise.all([
    prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.inventoryCount.findMany({
      include: { warehouse: true, createdBy: true, items: true },
      orderBy: { startedAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventarizatsiya</h1>
        <p className="text-sm text-muted-foreground">
          Ombordagi haqiqiy qoldiqni tizimdagi qoldiq bilan solishtirish
        </p>
      </div>

      {canManage && <StartCountForm warehouses={warehouses} />}

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sana</TableHead>
                <TableHead>Ombor</TableHead>
                <TableHead>Boshlagan</TableHead>
                <TableHead>Pozitsiyalar</TableHead>
                <TableHead>Holat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {counts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    Inventarizatsiyalar mavjud emas
                  </TableCell>
                </TableRow>
              ) : (
                counts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{format(c.startedAt, "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell>{c.warehouse.name}</TableCell>
                    <TableCell>{c.createdBy.name}</TableCell>
                    <TableCell>{c.items.length}</TableCell>
                    <TableCell>
                      <Link href={`/inventory/counts/${c.id}`}>
                        <Badge
                          variant={c.status === "COMPLETED" ? "secondary" : "outline"}
                          className="cursor-pointer"
                        >
                          {c.status === "COMPLETED" ? "Yakunlangan" : "Jarayonda"}
                        </Badge>
                      </Link>
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
