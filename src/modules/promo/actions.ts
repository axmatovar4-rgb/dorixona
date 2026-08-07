"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { logAudit } from "@/lib/audit";
import { promoCodeSchema, type PromoCodeInput } from "@/modules/promo/schemas";

export async function createPromoCode(input: PromoCodeInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "promoCodes", "create"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = promoCodeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const code = parsed.data.code.toUpperCase();
  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) return { error: "Bu kod allaqachon mavjud" };

  const promoCode = await prisma.promoCode.create({
    data: {
      code,
      discountPercent: parsed.data.discountPercent,
      products: parsed.data.productIds?.length
        ? { connect: parsed.data.productIds.map((id) => ({ id })) }
        : undefined,
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entityType: "PromoCode", entityId: promoCode.id });
  revalidatePath("/promo-codes");
  return { success: true as const };
}

export async function updatePromoCode(id: string, input: { discountPercent: number; productIds: string[] }) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "promoCodes", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const discountPercent = Math.round(input.discountPercent);
  if (!Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 90) {
    return { error: "Chegirma 1 dan 90 gacha bo'lishi kerak" };
  }

  await prisma.promoCode.update({
    where: { id },
    data: {
      discountPercent,
      products: { set: input.productIds.map((productId) => ({ id: productId })) },
    },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entityType: "PromoCode", entityId: id });
  revalidatePath("/promo-codes");
  return { success: true as const };
}

export async function togglePromoCodeActive(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "promoCodes", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.promoCode.update({ where: { id }, data: { isActive } });
  revalidatePath("/promo-codes");
  return { success: true as const };
}

export async function deletePromoCode(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "promoCodes", "delete"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.promoCode.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "DELETE", entityType: "PromoCode", entityId: id });
  revalidatePath("/promo-codes");
  return { success: true as const };
}

export async function checkPromoCode(rawCode: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { valid: false as const, error: "Sizda ruxsat yo'q" };
  }
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false as const, error: "Kodni kiriting" };

  const promoCode = await prisma.promoCode.findUnique({
    where: { code },
    include: { products: { select: { id: true } } },
  });
  if (!promoCode || !promoCode.isActive) {
    return { valid: false as const, error: "Bunday kod topilmadi yoki faol emas" };
  }
  return {
    valid: true as const,
    code,
    discountPercent: promoCode.discountPercent,
    productIds: promoCode.products.map((p) => p.id),
  };
}
