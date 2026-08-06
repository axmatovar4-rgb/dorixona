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
