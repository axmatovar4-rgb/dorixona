import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorManager } from "@/modules/doctors/components/doctor-manager";

export const metadata: Metadata = { title: "Shifokorlar" };

export default async function DoctorsPage() {
  const session = await auth();
  const canManage = await canAsync(session?.user.role, "doctors", "create");
  const doctors = await prisma.doctor.findMany({ orderBy: { fullName: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shifokorlar (PharmaMed)</h1>
        <p className="text-muted-foreground">Dorixonaning o&apos;z shifoxonasi shifokorlarini boshqarish</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Shifokorlar ro&apos;yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <DoctorManager doctors={doctors} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
