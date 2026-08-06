import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { StockOutForm } from "@/modules/inventory/components/stock-out-form";

export default async function StockOutPage() {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "create")) {
    redirect("/inventory/alerts");
  }

  const [products, warehouses] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.warehouse.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chiqim (Stock-out)</h1>
        <p className="text-sm text-muted-foreground">Ombordan mahsulot chiqarish</p>
      </div>
      <StockOutForm products={products} warehouses={warehouses} />
    </div>
  );
}
