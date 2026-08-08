import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentsTable } from "@/modules/doctors/components/appointments-table";

export const metadata: Metadata = { title: "Qabullar" };

export default async function AppointmentsPage() {
  const session = await auth();
  const canManage = await canAsync(session?.user.role, "doctors", "edit");
  const appointments = await prisma.appointment.findMany({
    orderBy: { scheduledAt: "desc" },
    include: {
      doctor: { select: { fullName: true, specialty: true } },
      customer: { select: { firstName: true, lastName: true, phone: true } },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Qabullar</h1>
        <p className="text-muted-foreground">Qaysi mijoz qaysi shifokorga qachon yozilgani</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Barcha qabullar</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentsTable appointments={appointments} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
