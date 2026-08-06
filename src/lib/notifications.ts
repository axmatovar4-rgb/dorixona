import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export async function createNotification(input: {
  customerId: string;
  type: NotificationType;
  title: string;
  body: string;
  productId?: string;
}) {
  return prisma.notification.create({
    data: {
      customerId: input.customerId,
      type: input.type,
      title: input.title,
      body: input.body,
      productId: input.productId ?? null,
    },
  });
}

export async function getUnreadCount(customerId: string) {
  return prisma.notification.count({ where: { customerId, isRead: false } });
}

export async function listNotifications(customerId: string, limit = 10) {
  return prisma.notification.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markAllRead(customerId: string) {
  await prisma.notification.updateMany({
    where: { customerId, isRead: false },
    data: { isRead: true },
  });
}
