"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { logAudit } from "@/lib/audit";
import { employeeSchema, type EmployeeInput } from "@/modules/hr/schemas";

export async function createEmployee(input: EmployeeInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "hr", "create"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = employeeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const employee = await prisma.employee.create({
    data: {
      fullName: parsed.data.fullName,
      position: parsed.data.position,
      department: parsed.data.department || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      hireDate: new Date(parsed.data.hireDate),
      salary: parsed.data.salary,
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entityType: "Employee", entityId: employee.id });
  revalidatePath("/hr");
  return { success: true as const };
}

export async function updateEmployee(id: string, input: EmployeeInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "hr", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = employeeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  await prisma.employee.update({
    where: { id },
    data: {
      fullName: parsed.data.fullName,
      position: parsed.data.position,
      department: parsed.data.department || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      hireDate: new Date(parsed.data.hireDate),
      salary: parsed.data.salary,
    },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entityType: "Employee", entityId: id });
  revalidatePath("/hr");
  return { success: true as const };
}

export async function toggleEmployeeActive(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "hr", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.employee.update({ where: { id }, data: { isActive } });
  revalidatePath("/hr");
  return { success: true as const };
}
