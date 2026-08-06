import { notFound } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CountDetailClient } from "@/modules/inventory/components/count-detail-client";

export default async function CountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const role = session!.user.role;

  const count = await prisma.inventoryCount.findUnique({
    where: { id },
    include: {
      warehouse: true,
      createdBy: true,
      items: { include: { product: true, batch: true } },
    },
  });
  if (!count) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Inventarizatsiya — {count.warehouse.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(count.startedAt, "dd.MM.yyyy HH:mm")} · {count.createdBy.name}
          </p>
        </div>
        <Badge variant={count.status === "COMPLETED" ? "secondary" : "outline"}>
          {count.status === "COMPLETED" ? "Yakunlangan" : "Jarayonda"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pozitsiyalar</CardTitle>
        </CardHeader>
        <CardContent>
          <CountDetailClient
            countId={count.id}
            isCompleted={count.status === "COMPLETED"}
            canEdit={can(role, "inventory", "edit")}
            items={count.items.map((i) => ({
              id: i.id,
              productName: i.product.name,
              batchNumber: i.batch.batchNumber,
              systemQty: i.systemQty,
              countedQty: i.countedQty,
              diff: i.diff,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
