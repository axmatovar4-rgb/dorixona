import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Hero } from "./hero";
import { CategoryStrip } from "./category-strip";
import { MedicineCard, type MedicineCardData } from "@/modules/customer/components/medicine-card";
import { PageContainer, SectionHeader } from "@/modules/customer/components/section";
import { AIBanner } from "@/modules/customer/components/ai-banner";
import { HealthTips } from "./health-tips";
import { ShopGrid } from "./shop-grid";

async function toCardData(
  products: {
    id: string;
    name: string;
    unit: string;
    dosage: string | null;
    sellPrice: unknown;
    prescriptionRequired: boolean;
    imageUrl: string | null;
    category?: { name: string } | null;
    brand?: { name: string } | null;
  }[]
): Promise<MedicineCardData[]> {
  const stockByProduct = await prisma.batch.groupBy({
    by: ["productId"],
    where: { productId: { in: products.map((p) => p.id) }, quantity: { gt: 0 } },
    _sum: { quantity: true },
  });
  const stockMap = new Map(stockByProduct.map((s) => [s.productId, s._sum.quantity ?? 0]));

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    dosage: p.dosage,
    sellPrice: String(p.sellPrice),
    prescriptionRequired: p.prescriptionRequired,
    imageUrl: p.imageUrl,
    category: p.category?.name ?? null,
    brand: p.brand?.name ?? null,
    inStock: (stockMap.get(p.id) ?? 0) > 0,
  }));
}

export const metadata: Metadata = { title: "Bosh sahifa" };

export default async function ShopHomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { search, category } = await searchParams;
  const isSearching = Boolean(search?.trim());

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { isActive: true } } } } },
    orderBy: { name: "asc" },
  });

  if (isSearching) {
    return (
      <PageContainer className="flex flex-col gap-6 py-8 sm:py-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            &quot;{search}&quot; uchun qidiruv natijalari
          </h1>
        </div>
        <ShopGrid
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          initialSearch={search ?? ""}
          initialCategoryId={category ?? ""}
        />
      </PageContainer>
    );
  }

  const [newArrivalsRaw, featuredRaw, bestSellingAgg] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, brand: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, brand: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    }),
  ]);

  let bestSellingProducts = await prisma.product.findMany({
    where: { id: { in: bestSellingAgg.map((b) => b.productId) }, isActive: true },
    include: { category: true, brand: true },
  });
  bestSellingProducts.sort(
    (a, b) =>
      (bestSellingAgg.find((x) => x.productId === b.id)?._sum.quantity ?? 0) -
      (bestSellingAgg.find((x) => x.productId === a.id)?._sum.quantity ?? 0)
  );
  if (bestSellingProducts.length < 4) {
    const excludeIds = new Set(bestSellingProducts.map((p) => p.id));
    const filler = await prisma.product.findMany({
      where: { isActive: true, id: { notIn: [...excludeIds] } },
      include: { category: true, brand: true },
      orderBy: { name: "asc" },
      take: 8 - bestSellingProducts.length,
    });
    bestSellingProducts = [...bestSellingProducts, ...filler];
  }

  const [newArrivals, featured, bestSelling] = await Promise.all([
    toCardData(newArrivalsRaw),
    toCardData(featuredRaw),
    toCardData(bestSellingProducts),
  ]);

  return (
    <div className="flex flex-col gap-16 pb-16 sm:gap-20">
      <Hero />

      <PageContainer>
        <CategoryStrip
          categories={categories.map((c) => ({ id: c.id, name: c.name, count: c._count.products }))}
        />
      </PageContainer>

      <PageContainer>
        <SectionHeader
          title="Tavsiya etilgan dorilar"
          subtitle="Siz uchun tanlangan sifatli mahsulotlar"
          href="/shop#catalog"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <MedicineCard key={p.id} product={p} />
          ))}
        </div>
      </PageContainer>

      <PageContainer>
        <SectionHeader
          title="Ko'p sotiladigan dorilar"
          subtitle="Mijozlarimiz tez-tez sotib oladigan mahsulotlar"
          href="/shop#catalog"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {bestSelling.map((p) => (
            <MedicineCard key={p.id} product={p} />
          ))}
        </div>
      </PageContainer>

      <PageContainer>
        <SectionHeader title="Yangi qo'shilgan" subtitle="Katalogimizdagi so'nggi yangiliklar" href="/shop#catalog" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {newArrivals.map((p) => (
            <MedicineCard key={p.id} product={p} />
          ))}
        </div>
      </PageContainer>

      <PageContainer>
        <HealthTips />
      </PageContainer>

      <PageContainer>
        <AIBanner />
      </PageContainer>

      <PageContainer>
        <div id="catalog" className="scroll-mt-20">
          <SectionHeader title="Barcha dorilar" subtitle="Katalogni qidiring va filtrlang" />
          <ShopGrid
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            initialSearch={search ?? ""}
            initialCategoryId={category ?? ""}
          />
        </div>
      </PageContainer>
    </div>
  );
}
