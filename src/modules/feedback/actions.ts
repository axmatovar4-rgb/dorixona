"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appFeedbackSchema, type AppFeedbackInput } from "@/modules/feedback/schemas";

export async function submitAppFeedback(input: AppFeedbackInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = appFeedbackSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  await prisma.appFeedback.create({
    data: {
      customerId: session.user.id,
      rating: parsed.data.rating ?? null,
      message: parsed.data.message,
    },
  });

  revalidatePath("/account/feedback");
  return { success: true as const };
}
