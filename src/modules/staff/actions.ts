"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getMyStaffNotifications(limit = 10) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF") {
    return { notifications: [], unreadCount: 0 };
  }
  const [notifications, unreadCount] = await Promise.all([
    prisma.staffNotification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.staffNotification.count({ where: { userId: session.user.id, isRead: false } }),
  ]);
  return { notifications, unreadCount };
}

export async function markStaffNotificationsRead() {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF") return;
  await prisma.staffNotification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/notifications");
}
