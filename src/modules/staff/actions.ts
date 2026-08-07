"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  updateStaffProfileSchema,
  changeStaffPasswordSchema,
  type UpdateStaffProfileInput,
  type ChangeStaffPasswordInput,
} from "@/modules/staff/schemas";

export async function updateStaffProfile(input: UpdateStaffProfileInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF") {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = updateStaffProfileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  await prisma.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name } });
  revalidatePath("/profile");
  return { success: true as const };
}

export async function changeStaffPassword(input: ChangeStaffPasswordInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF") {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = changeStaffPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Foydalanuvchi topilmadi" };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Joriy parol noto'g'ri" };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } });
  return { success: true as const };
}

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
