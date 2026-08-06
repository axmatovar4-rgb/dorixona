import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { BranchManager } from "@/modules/inventory/components/branch-manager";

export default async function BranchesPage() {
  const session = await auth();
  const role = session!.user.role;

  const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Filiallar</h1>
        <p className="text-sm text-muted-foreground">Dorixona filiallari ro&apos;yxati</p>
      </div>
      <BranchManager branches={branches} canManage={can(role, "inventory", "create")} />
    </div>
  );
}
