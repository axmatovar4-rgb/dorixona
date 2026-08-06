"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { logAudit } from "@/lib/audit";
import { transactionSchema, type TransactionInput } from "@/modules/finance/schemas";

export async function createTransaction(input: TransactionInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "finance", "create"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const tx = await prisma.transaction.create({
    data: {
      type: parsed.data.type,
      category: parsed.data.category,
      amount: parsed.data.amount,
      description: parsed.data.description || null,
      occurredAt: new Date(parsed.data.occurredAt),
      createdById: session.user.id,
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entityType: "Transaction", entityId: tx.id });
  revalidatePath("/finance");
  return { success: true as const };
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "finance", "delete"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/finance");
  return { success: true as const };
}
