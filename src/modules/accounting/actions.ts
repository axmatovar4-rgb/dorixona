"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { logAudit } from "@/lib/audit";
import { invoiceSchema, type InvoiceInput } from "@/modules/accounting/schemas";

export async function createInvoice(input: InvoiceInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "accounting", "create"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const invoice = await prisma.invoice.create({
    data: {
      type: parsed.data.type,
      partyName: parsed.data.partyName,
      amount: parsed.data.amount,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      createdById: session.user.id,
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entityType: "Invoice", entityId: invoice.id });
  revalidatePath("/accounting");
  return { success: true as const };
}

export async function markInvoicePaid(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "accounting", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.invoice.update({ where: { id }, data: { status: "PAID", paidAt: new Date() } });
  revalidatePath("/accounting");
  return { success: true as const };
}
