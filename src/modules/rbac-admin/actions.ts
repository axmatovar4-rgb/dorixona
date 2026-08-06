"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { NewModuleName } from "@/lib/rbac-modules";
import type { Action } from "@/lib/rbac";

export async function getRolePermissions(role: Role) {
  return prisma.rolePermission.findMany({ where: { role } });
}

export async function setRolePermission(role: Role, module: NewModuleName, action: Action, allowed: boolean) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || session.user.role !== "SUPER_ADMIN") {
    return { error: "Faqat Super Admin ruxsatlarni o'zgartira oladi" };
  }

  await prisma.rolePermission.upsert({
    where: { role_module_action: { role, module, action } },
    update: { allowed },
    create: { role, module, action, allowed },
  });

  revalidatePath("/rbac");
  return { success: true as const };
}
