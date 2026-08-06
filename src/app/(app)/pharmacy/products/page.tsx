import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductsTable } from "./products-table";

export default async function ProductsPage() {
  const session = await auth();
  const role = session!.user.role;

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dorilar katalogi</h1>
          <p className="text-sm text-muted-foreground">
            Barcha mahsulotlar, barkod, narx va joriy qoldiqlar
          </p>
        </div>
        {can(role, "pharmacy", "create") && (
          <Link
            href="/pharmacy/products/new"
            className={cn(buttonVariants(), "gap-1.5")}
          >
            <Plus className="h-4 w-4" />
            Yangi dori
          </Link>
        )}
      </div>

      <ProductsTable
        categories={categories}
        brands={brands}
        canEdit={can(role, "pharmacy", "edit")}
      />
    </div>
  );
}
