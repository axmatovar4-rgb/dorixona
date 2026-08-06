import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchFullManager } from "@/modules/branches/components/branch-full-manager";

export const metadata: Metadata = { title: "Filiallar boshqaruvi" };

export default async function BranchesPage() {
  const session = await auth();
  const canManage = await canAsync(session?.user.role, "branchManagement", "create");

  const [branches, managers] = await Promise.all([
    prisma.branch.findMany({
      orderBy: { name: "asc" },
      include: { manager: { select: { name: true } }, _count: { select: { warehouses: true } } },
    }),
    prisma.user.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Filiallarni boshqarish</h1>
        <p className="text-muted-foreground">Filiallar, menejerlar va omborlar soni</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filiallar</CardTitle>
        </CardHeader>
        <CardContent>
          <BranchFullManager branches={branches} managers={managers} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
