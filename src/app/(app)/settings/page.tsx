import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/modules/settings/components/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const settings = await prisma.appSetting.findUnique({ where: { id: "singleton" } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sozlamalar</h1>
        <p className="text-muted-foreground">Kompaniya va aloqa ma&apos;lumotlari</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Umumiy sozlamalar</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            settings={
              settings ?? { companyName: "PharmCare", supportPhone: null, supportEmail: null, currencySymbol: "so'm" }
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
