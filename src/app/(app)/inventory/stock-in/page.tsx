import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { StockInForm } from "@/modules/inventory/components/stock-in-form";

export default async function StockInPage() {
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
        <h1 className="text-2xl font-semibold tracking-tight">Kirim (Stock-in)</h1>
        <p className="text-sm text-muted-foreground">Omborga yangi partiya qabul qilish</p>
      </div>
      <StockInForm products={products} warehouses={warehouses} />
    </div>
  );
}
