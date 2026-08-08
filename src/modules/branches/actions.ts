"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { logAudit } from "@/lib/audit";

export async function createBranchFull(input: {
  name: string;
  region: string;
  address: string;
  phone: string;
  managerId: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "branchManagement", "create"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  if (!input.name.trim()) return { error: "Nomini kiriting" };

  const branch = await prisma.branch.create({
    data: {
      name: input.name,
      region: input.region || null,
      address: input.address || null,
      phone: input.phone || null,
      managerId: input.managerId || null,
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entityType: "Branch", entityId: branch.id });
  revalidatePath("/branches");
  return { success: true as const };
}

export async function toggleBranchActive(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "branchManagement", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.branch.update({ where: { id }, data: { isActive } });
  revalidatePath("/branches");
  return { success: true as const };
}
