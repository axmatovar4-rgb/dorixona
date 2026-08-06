import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupplierManager } from "@/modules/suppliers/components/supplier-manager";

export const metadata: Metadata = { title: "Yetkazib beruvchilar" };

export default async function SuppliersPage() {
  const session = await auth();
  const canManage = await canAsync(session?.user.role, "supplierManagement", "create");
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Yetkazib beruvchilar</h1>
        <p className="text-muted-foreground">Ta&apos;minotchilar ro&apos;yxatini boshqarish</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Yetkazib beruvchilar ro&apos;yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplierManager suppliers={suppliers} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
