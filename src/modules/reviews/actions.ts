"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema, type ReviewInput } from "@/modules/reviews/schemas";

export async function canReviewProduct(productId: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") return false;
  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { customerId: session.user.id, status: "DELIVERED" },
    },
  });
  return !!purchased;
}

export async function submitReview(input: ReviewInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: { customerId: session.user.id, status: "DELIVERED" },
    },
  });
  if (!purchased) {
    return { error: "Faqat sotib olib, yetkazib berilgan mahsulotga baho qoldirish mumkin" };
  }

  await prisma.review.upsert({
    where: { productId_customerId: { productId: parsed.data.productId, customerId: session.user.id } },
    create: {
      productId: parsed.data.productId,
      customerId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
  });

  revalidatePath(`/shop/${parsed.data.productId}`);
  return { success: true as const };
}

export async function getMyReview(productId: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") return null;
  return prisma.review.findUnique({
    where: { productId_customerId: { productId, customerId: session.user.id } },
  });
}
