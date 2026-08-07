import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/role-labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffProfileForm } from "@/modules/staff/components/staff-profile-form";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { branch: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">Shaxsiy ma&apos;lumotlar va parolni boshqarish</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ma&apos;lumotlar</CardTitle>
        </CardHeader>
        <CardContent>
          <StaffProfileForm
            name={user.name}
            email={user.email}
            roleLabel={ROLE_LABELS[user.role]}
            branchName={user.branch?.name ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
