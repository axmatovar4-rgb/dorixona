import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Hero } from "./hero";
import { MedicineCard, type MedicineCardData } from "@/modules/customer/components/medicine-card";
import { PageContainer, SectionHeader } from "@/modules/customer/components/section";
import { AIBanner } from "@/modules/customer/components/ai-banner";
import { HealthTips } from "./health-tips";
import { ShopGrid } from "./shop-grid";
import { PartnersSection, CertificatesSection, BranchesSection, ContactSection } from "./trust-sections";
import { PharmaMedSection } from "./pharmamed-section";
import { StatsSection } from "./stats-section";
import { getActivePromoMap } from "@/modules/customer/promo-map";
import { getRatingsMap } from "@/modules/customer/ratings-map";

async function toCardData(
  products: {
    id: string;
    name: string;
    unit: string;
    dosage: string | null;
    sellPrice: unknown;
    oldPrice: unknown;
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
  const promoMap = await getActivePromoMap(products.map((p) => p.id));
  const ratingsMap = await getRatingsMap(products.map((p) => p.id));

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    dosage: p.dosage,
    sellPrice: String(p.sellPrice),
    oldPrice: p.oldPrice != null ? String(p.oldPrice) : null,
    promo: promoMap.get(p.id) ?? null,
    rating: ratingsMap.get(p.id) ?? { avg: 0, count: 0 },
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

  const [categories, countriesRaw] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.manufacturer.findMany({
      where: { country: { not: null }, products: { some: { isActive: true } } },
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" },
    }),
  ]);
  const countries = countriesRaw.map((c) => c.country!).filter(Boolean);

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
          countries={countries}
          initialSearch={search ?? ""}
          initialCategoryId={category ?? ""}
        />
      </PageContainer>
    );
  }

  const [featuredRaw, bestSellingAgg] = await Promise.all([
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

  const [featured, bestSelling] = await Promise.all([
    toCardData(featuredRaw),
    toCardData(bestSellingProducts),
  ]);

  return (
    <div className="flex flex-col gap-16 pb-16 sm:gap-20">
      <Hero />

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
        <PharmaMedSection />
      </PageContainer>

      <PageContainer>
        <HealthTips />
      </PageContainer>

      <PageContainer>
        <BranchesSection />
      </PageContainer>

      <PageContainer>
        <PartnersSection />
      </PageContainer>

      <PageContainer>
        <CertificatesSection />
      </PageContainer>

      <PageContainer>
        <ContactSection />
      </PageContainer>

      <PageContainer>
        <AIBanner />
      </PageContainer>

      <PageContainer>
        <div id="catalog" className="scroll-mt-20">
          <SectionHeader title="Barcha dorilar" subtitle="Katalogni qidiring va filtrlang" />
          <ShopGrid
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            countries={countries}
            initialSearch={search ?? ""}
            initialCategoryId={category ?? ""}
          />
        </div>
      </PageContainer>

      <PageContainer>
        <StatsSection />
      </PageContainer>
    </div>
  );
}
