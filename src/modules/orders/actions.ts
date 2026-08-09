"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !can(session.user.role, "sales", "edit")) {
    return { error: "Sizda ruxsat yo'q" };
  }

  if (status !== "PENDING" && status !== "CANCELLED") {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { requiresPrescription: true, prescriptionImageUrl: true },
    });
    if (order?.requiresPrescription && !order.prescriptionImageUrl) {
      return { error: "Retsept rasmi hali yuklanmagan — buyurtmani tayyorlashga o'tkazib bo'lmaydi" };
    }
  }

  await prisma.order.update({ where: { id: orderId }, data: { status } });

  await logAudit({
    userId: session.user.id,
    action: "UPDATE_STATUS",
    entityType: "Order",
    entityId: orderId,
    changes: { status },
  });

  revalidatePath("/sales/orders");
  revalidatePath(`/sales/orders/${orderId}`);
  return { success: true as const };
}

export async function resolveReturnRequest(orderId: string, approve: boolean, note: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !can(session.user.role, "sales", "edit")) {
    return { error: "Sizda ruxsat yo'q" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      returnStatus: approve ? "APPROVED" : "REJECTED",
      returnNote: note.trim() || null,
      ...(approve ? { status: "CANCELLED" as OrderStatus } : {}),
    },
  });

  await logAudit({
    userId: session.user.id,
    action: approve ? "APPROVE_RETURN" : "REJECT_RETURN",
    entityType: "Order",
    entityId: orderId,
  });

  revalidatePath("/sales/orders");
  revalidatePath(`/sales/orders/${orderId}`);
  return { success: true as const };
}

export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !can(session.user.role, "sales", "edit")) {
    return { error: "Sizda ruxsat yo'q" };
  }

  await prisma.order.update({ where: { id: orderId }, data: { paymentStatus } });

  revalidatePath("/sales/orders");
  revalidatePath(`/sales/orders/${orderId}`);
  return { success: true as const };
}
