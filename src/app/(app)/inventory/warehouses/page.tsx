import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { WarehouseManager } from "@/modules/inventory/components/warehouse-manager";

export default async function WarehousesPage() {
  const session = await auth();
  const role = session!.user.role;

  const [warehouses, branches] = await Promise.all([
    prisma.warehouse.findMany({ include: { branch: true }, orderBy: { name: "asc" } }),
    prisma.branch.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Omborlar</h1>
        <p className="text-sm text-muted-foreground">Filiallarga bog&apos;liq omborlar ro&apos;yxati</p>
      </div>
      <WarehouseManager
        warehouses={warehouses}
        branches={branches}
        canManage={can(role, "inventory", "create")}
      />
    </div>
  );
}
