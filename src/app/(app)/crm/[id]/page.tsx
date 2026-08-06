import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANT } from "@/lib/order-labels";
import { AddNoteForm } from "@/modules/crm/components/add-note-form";

export const metadata: Metadata = { title: "Mijoz tafsilotlari" };

export default async function CrmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const canAddNote = await canAsync(session?.user.role, "crm", "create");

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
      notes: { orderBy: { createdAt: "desc" }, include: { createdBy: { select: { name: true } } } },
    },
  });
  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {customer.firstName} {customer.lastName}
        </h1>
        <p className="text-muted-foreground">{customer.phone} · {customer.address || "Manzil ko'rsatilmagan"}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Buyurtmalar tarixi</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {customer.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Buyurtmalar yo&apos;q</p>
            ) : (
              customer.orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{format(o.createdAt, "dd.MM.yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{Number(o.total).toLocaleString("uz-UZ")} so&apos;m</span>
                    <Badge variant={ORDER_STATUS_VARIANT[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Izohlar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {canAddNote && <AddNoteForm customerId={customer.id} />}
            {customer.notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Izohlar yo&apos;q</p>
            ) : (
              customer.notes.map((n) => (
                <div key={n.id} className="rounded-lg border p-3 text-sm">
                  <p>{n.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {n.createdBy.name} · {format(n.createdAt, "dd.MM.yyyy HH:mm")}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
