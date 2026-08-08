import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryZoneManager } from "@/modules/delivery/components/delivery-zone-manager";

export const metadata: Metadata = { title: "Yetkazib berish hududlari" };

export default async function DeliveryZonesPage() {
  const session = await auth();
  const canManage = await canAsync(session?.user.role, "deliveryZones", "create");
  const zonesRaw = await prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } });
  const zones = zonesRaw.map((z) => ({
    id: z.id,
    name: z.name,
    fee: Number(z.fee),
    isDefault: z.isDefault,
    isActive: z.isActive,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Yetkazib berish hududlari</h1>
        <p className="text-muted-foreground">Checkout&apos;da mijoz tanlaydigan hudud va narxlari</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Hududlar ro&apos;yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <DeliveryZoneManager zones={zones} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
