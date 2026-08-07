import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PromoCodeManager } from "@/modules/promo/components/promo-code-manager";

export const metadata: Metadata = { title: "Aksiya kodlari" };

export default async function PromoCodesPage() {
  const session = await auth();
  const canManage = await canAsync(session?.user.role, "promoCodes", "create");
  const promoCodes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Aksiya kodlari</h1>
        <p className="text-muted-foreground">Checkout&apos;da mijozlar kirita oladigan chegirma kodlari</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Kodlar ro&apos;yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <PromoCodeManager promoCodes={promoCodes} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
