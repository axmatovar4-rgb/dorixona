"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { createStaffUserSchema, type CreateStaffUserInput } from "@/modules/users/schemas";

function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function createStaffUser(input: CreateStaffUserInput) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Sizda ruxsat yo'q" };
  }
  const parsed = createStaffUserSchema.safeParse(input);
  if (!parsed.success)
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { success: false as const, error: "Bu email allaqachon mavjud" };

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      branchId: parsed.data.branchId || null,
      passwordHash,
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entityType: "User", entityId: user.id });
  revalidatePath("/users");
  return { success: true as const, tempPassword };
}

export async function resetStaffUserPassword(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { success: false as const, error: "Sizda ruxsat yo'q" };
  }
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });

  await logAudit({ userId: session.user.id, action: "RESET_PASSWORD", entityType: "User", entityId: id });
  return { success: true as const, tempPassword };
}

export async function toggleStaffUserActive(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.user.update({ where: { id }, data: { isActive } });
  revalidatePath("/users");
  return { success: true as const };
}
