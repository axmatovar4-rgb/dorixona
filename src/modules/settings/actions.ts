"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateAppSettings(input: {
  companyName: string;
  supportPhone: string;
  supportEmail: string;
  currencySymbol: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || session.user.role !== "SUPER_ADMIN") {
    return { error: "Faqat Super Admin sozlamalarni o'zgartira oladi" };
  }
  if (!input.companyName.trim()) return { error: "Kompaniya nomini kiriting" };

  await prisma.appSetting.upsert({
    where: { id: "singleton" },
    update: {
      companyName: input.companyName,
      supportPhone: input.supportPhone || null,
      supportEmail: input.supportEmail || null,
      currencySymbol: input.currencySymbol || "so'm",
    },
    create: {
      id: "singleton",
      companyName: input.companyName,
      supportPhone: input.supportPhone || null,
      supportEmail: input.supportEmail || null,
      currencySymbol: input.currencySymbol || "so'm",
    },
  });

  revalidatePath("/settings");
  return { success: true as const };
}
