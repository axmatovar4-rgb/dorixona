import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayslipManager } from "@/modules/payroll/components/payslip-manager";

export const metadata: Metadata = { title: "Ish haqi" };

export default async function PayrollPage() {
  const session = await auth();
  const canManage = await canAsync(session?.user.role, "payroll", "create");

  const [employees, payslips] = await Promise.all([
    prisma.employee.findMany({ where: { isActive: true }, select: { id: true, fullName: true, salary: true }, orderBy: { fullName: "asc" } }),
    prisma.payslip.findMany({ orderBy: { createdAt: "desc" }, include: { employee: { select: { fullName: true } } }, take: 100 }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ish haqi (Payroll)</h1>
        <p className="text-muted-foreground">Oylik hisoblanmalarni yaratish va kuzatish</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Hisoblanmalar</CardTitle>
        </CardHeader>
        <CardContent>
          <PayslipManager employees={employees} payslips={payslips} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
