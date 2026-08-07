import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { ProductForm } from "@/modules/pharmacy/components/product-form";

export const metadata: Metadata = { title: "Dorini tahrirlash" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !can(session.user.role, "pharmacy", "edit")) {
    redirect(`/pharmacy/products/${id}`);
  }

  const [product, categories, brands, manufacturers, activeIngredients] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.manufacturer.findMany({ orderBy: { name: "asc" } }),
    prisma.activeIngredient.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dorini tahrirlash</h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>
      <ProductForm
        productId={product.id}
        defaultValues={{
          name: product.name,
          barcode: product.barcode,
          categoryId: product.categoryId ?? "",
          brandId: product.brandId ?? "",
          manufacturerId: product.manufacturerId ?? "",
          activeIngredientId: product.activeIngredientId ?? "",
          dosage: product.dosage ?? "",
          unit: product.unit,
          prescriptionRequired: product.prescriptionRequired,
          imageUrl: product.imageUrl ?? "",
          description: product.description ?? "",
          purchasePrice: Number(product.purchasePrice),
          sellPrice: Number(product.sellPrice),
          oldPrice: product.oldPrice != null ? Number(product.oldPrice) : undefined,
          minStock: product.minStock,
          maxStock: product.maxStock,
          stockMethod: product.stockMethod,
          isActive: product.isActive,
        }}
        categories={categories}
        brands={brands}
        manufacturers={manufacturers}
        activeIngredients={activeIngredients}
      />
    </div>
  );
}
