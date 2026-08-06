import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseOrderForm } from "@/modules/procurement/components/purchase-order-form";
import { PurchaseOrderList } from "@/modules/procurement/components/purchase-order-list";

export const metadata: Metadata = { title: "Xaridlar" };

export default async function ProcurementPage() {
  const session = await auth();
  const canCreate = await canAsync(session?.user.role, "procurement", "create");
  const canEdit = await canAsync(session?.user.role, "procurement", "edit");

  const [orders, suppliers, warehouses, products] = await Promise.all([
    prisma.purchaseOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: { supplier: true, warehouse: true, items: { select: { quantity: true, unitPrice: true } } },
      take: 50,
    }),
    prisma.supplier.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.warehouse.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Xarid buyurtmalari</h1>
        <p className="text-muted-foreground">Yetkazib beruvchilardan mahsulot xarid qilish</p>
      </div>

      {canCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Yangi buyurtma</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseOrderForm suppliers={suppliers} warehouses={warehouses} products={products} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Buyurtmalar ro&apos;yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseOrderList orders={orders} canManage={canEdit} />
        </CardContent>
      </Card>
    </div>
  );
}
