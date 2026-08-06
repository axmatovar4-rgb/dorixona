import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RbacGrid } from "@/modules/rbac-admin/components/rbac-grid";

export default async function RbacPage() {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rollar va ruxsatlar (RBAC)</h1>
        <p className="text-muted-foreground">Yangi modullar uchun rol bo&apos;yicha ruxsatlarni boshqarish</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ruxsatlar jadvali</CardTitle>
        </CardHeader>
        <CardContent>
          <RbacGrid />
        </CardContent>
      </Card>
    </div>
  );
}
