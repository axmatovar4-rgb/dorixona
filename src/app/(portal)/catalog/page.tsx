import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/modules/customer/components/section";
import { ShopGrid } from "../shop/shop-grid";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { search, category } = await searchParams;

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { isActive: true } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <PageContainer className="flex flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dorixona</h1>
        <p className="mt-2 text-muted-foreground">Barcha dorilarni qidiring va buyurtma bering</p>
      </div>
      <ShopGrid
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initialSearch={search ?? ""}
        initialCategoryId={category ?? ""}
      />
    </PageContainer>
  );
}
