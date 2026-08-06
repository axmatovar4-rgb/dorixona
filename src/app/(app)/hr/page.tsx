import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeManager } from "@/modules/hr/components/employee-manager";

export default async function HrPage() {
  const session = await auth();
  const canManage = await canAsync(session?.user.role, "hr", "create");
  const employees = await prisma.employee.findMany({ orderBy: { fullName: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Xodimlar (HR)</h1>
        <p className="text-muted-foreground">Xodimlar bazasini boshqarish</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Xodimlar ro&apos;yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeManager employees={employees} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
