import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { ProductForm } from "@/modules/pharmacy/components/product-form";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "pharmacy", "create")) {
    redirect("/pharmacy/products");
  }

  const [categories, brands, manufacturers, activeIngredients] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.manufacturer.findMany({ orderBy: { name: "asc" } }),
    prisma.activeIngredient.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Yangi dori qo&apos;shish</h1>
        <p className="text-sm text-muted-foreground">Dorilar katalogiga yangi mahsulot qo&apos;shing</p>
      </div>
      <ProductForm
        categories={categories}
        brands={brands}
        manufacturers={manufacturers}
        activeIngredients={activeIngredients}
      />
    </div>
  );
}
