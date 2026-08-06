"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";

export async function addCustomerNote(customerId: string, note: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "crm", "create"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  if (!note.trim()) return { error: "Izoh bo'sh bo'lmasin" };

  await prisma.customerNote.create({
    data: { customerId, note: note.trim(), createdById: session.user.id },
  });
  revalidatePath(`/crm/${customerId}`);
  return { success: true as const };
}
