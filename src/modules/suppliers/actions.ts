"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { logAudit } from "@/lib/audit";
import { supplierSchema, type SupplierInput } from "@/modules/suppliers/schemas";

export async function createSupplier(input: SupplierInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "supplierManagement", "create"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const supplier = await prisma.supplier.create({
    data: {
      name: parsed.data.name,
      contactPerson: parsed.data.contactPerson || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entityType: "Supplier", entityId: supplier.id });
  revalidatePath("/suppliers");
  return { success: true as const };
}

export async function toggleSupplierActive(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "supplierManagement", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.supplier.update({ where: { id }, data: { isActive } });
  revalidatePath("/suppliers");
  return { success: true as const };
}

export async function deleteSupplier(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "supplierManagement", "delete"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.supplier.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "DELETE", entityType: "Supplier", entityId: id });
  revalidatePath("/suppliers");
  return { success: true as const };
}
