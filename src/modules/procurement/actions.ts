"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { logAudit } from "@/lib/audit";
import { purchaseOrderSchema, type PurchaseOrderInput } from "@/modules/procurement/schemas";

export async function createPurchaseOrder(input: PurchaseOrderInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "procurement", "create"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = purchaseOrderSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const po = await prisma.purchaseOrder.create({
    data: {
      supplierId: parsed.data.supplierId,
      warehouseId: parsed.data.warehouseId,
      createdById: session.user.id,
      status: "DRAFT",
      items: {
        create: parsed.data.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      },
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entityType: "PurchaseOrder", entityId: po.id });
  revalidatePath("/procurement");
  return { success: true as const };
}

export async function markPurchaseOrdered(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "procurement", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.purchaseOrder.update({ where: { id }, data: { status: "ORDERED" } });
  revalidatePath("/procurement");
  return { success: true as const };
}

export async function cancelPurchaseOrder(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "procurement", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.purchaseOrder.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/procurement");
  return { success: true as const };
}

export async function receivePurchaseOrder(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "procurement", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }

  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!po) return { error: "Buyurtma topilmadi" };
  if (po.status === "RECEIVED") return { error: "Allaqachon qabul qilingan" };

  await prisma.$transaction(async (tx) => {
    for (const item of po.items) {
      const batch = await tx.batch.create({
        data: {
          productId: item.productId,
          warehouseId: po.warehouseId,
          batchNumber: `PO-${po.id.slice(-6).toUpperCase()}`,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          quantity: item.quantity,
          purchasePrice: item.unitPrice,
        },
      });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          batchId: batch.id,
          warehouseId: po.warehouseId,
          type: "IN",
          quantity: item.quantity,
          reason: `Xarid buyurtmasi #${po.id.slice(-6).toUpperCase()}`,
          performedById: session.user.id,
        },
      });
    }
    await tx.purchaseOrder.update({
      where: { id },
      data: { status: "RECEIVED", receivedAt: new Date() },
    });
  });

  await logAudit({ userId: session.user.id, action: "RECEIVE", entityType: "PurchaseOrder", entityId: id });
  revalidatePath("/procurement");
  revalidatePath("/inventory/movements");
  revalidatePath("/inventory/alerts");
  return { success: true as const };
}
