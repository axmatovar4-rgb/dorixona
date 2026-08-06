import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { OrdersTable } from "./orders-table";

export const metadata: Metadata = { title: "Buyurtmalar" };

export default async function SalesOrdersPage() {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "sales", "view")) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Buyurtmalar</h1>
        <p className="text-sm text-muted-foreground">Mijozlar buyurtmalarini boshqarish</p>
      </div>
      <OrdersTable canEdit={can(session.user.role, "sales", "edit")} />
    </div>
  );
}
