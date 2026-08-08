import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManager } from "@/modules/users/components/user-manager";

export const metadata: Metadata = { title: "Foydalanuvchilar" };

export default async function UsersPage() {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const [users, branches] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: "asc" },
      include: { branch: { select: { name: true } } },
    }),
    prisma.branch.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Foydalanuvchilar</h1>
        <p className="text-muted-foreground">Xodim login hisoblarini yaratish, parolni tiklash</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ro&apos;yxat</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManager
            users={users.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              isActive: u.isActive,
              branch: u.branch,
            }))}
            branches={branches.map((b) => ({ id: b.id, name: b.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
