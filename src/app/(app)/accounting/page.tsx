import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceManager } from "@/modules/accounting/components/invoice-manager";

export const metadata: Metadata = { title: "Accounting" };

export default async function AccountingPage() {
  const session = await auth();
  const canManage = await canAsync(session?.user.role, "accounting", "create");
  const invoices = await prisma.invoice.findMany({ orderBy: { issuedAt: "desc" }, take: 100 });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buxgalteriya</h1>
        <p className="text-muted-foreground">Hisob-fakturalar (sotuv va xarid)</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Hisob-fakturalar</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceManager invoices={invoices} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
