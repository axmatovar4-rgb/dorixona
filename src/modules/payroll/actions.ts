"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { logAudit } from "@/lib/audit";
import { payslipSchema, type PayslipInput } from "@/modules/payroll/schemas";

export async function createPayslip(input: PayslipInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "payroll", "create"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = payslipSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const netPay = parsed.data.baseSalary + parsed.data.bonuses - parsed.data.deductions;

  let payslipId: string;
  try {
    const payslip = await prisma.payslip.create({
      data: {
        employeeId: parsed.data.employeeId,
        month: parsed.data.month,
        baseSalary: parsed.data.baseSalary,
        bonuses: parsed.data.bonuses,
        deductions: parsed.data.deductions,
        netPay,
      },
    });
    payslipId = payslip.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Bu xodim uchun shu oyda hisoblanma allaqachon mavjud" };
    }
    throw error;
  }

  await logAudit({ userId: session.user.id, action: "CREATE", entityType: "Payslip", entityId: payslipId });
  revalidatePath("/payroll");
  return { success: true as const };
}

export async function markPayslipPaid(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "payroll", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.payslip.update({ where: { id }, data: { status: "PAID", paidAt: new Date() } });
  revalidatePath("/payroll");
  return { success: true as const };
}
