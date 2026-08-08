import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Pill,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertTriangle,
  Info,
  Factory,
  FlaskConical,
  Tag,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { PageContainer, SectionHeader } from "@/modules/customer/components/section";
import { RatingStars } from "@/modules/customer/components/rating-stars";
import { derivedRating } from "@/modules/customer/rating";
import { MedicineCard, type MedicineCardData } from "@/modules/customer/components/medicine-card";
import { AddToCart } from "@/modules/customer/components/add-to-cart";
import { StockAlertButton } from "@/modules/customer/components/stock-alert-button";
import { getFrequentlyBoughtWith } from "@/modules/customer/recommendations";
import { getActivePromoMap } from "@/modules/customer/promo-map";
import { StickyAddToCart } from "./sticky-add-to-cart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { name: true } });
  return { title: product?.name ?? "Dori" };
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, brand: true, manufacturer: true, activeIngredient: true },
  });
  if (!product || !product.isActive) notFound();

  const [stock, similarRaw, frequentlyBoughtWith] = await Promise.all([
    prisma.batch.aggregate({
      where: { productId: id, quantity: { gt: 0 } },
      _sum: { quantity: true },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: id },
        ...(product.categoryId ? { categoryId: product.categoryId } : {}),
      },
      include: { category: true, brand: true },
      take: 4,
    }),
    getFrequentlyBoughtWith(id),
  ]);
  const inStock = (stock._sum.quantity ?? 0) > 0;
  const rating = derivedRating(product.id);

  const similarStock = await prisma.batch.groupBy({
    by: ["productId"],
    where: { productId: { in: similarRaw.map((p) => p.id) }, quantity: { gt: 0 } },
    _sum: { quantity: true },
  });
  const similarStockMap = new Map(similarStock.map((s) => [s.productId, s._sum.quantity ?? 0]));
  const promoMap = await getActivePromoMap([id, ...similarRaw.map((p) => p.id)]);
  const productPromo = promoMap.get(id) ?? null;
  const similar: MedicineCardData[] = similarRaw.map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    dosage: p.dosage,
    sellPrice: String(p.sellPrice),
    oldPrice: p.oldPrice != null ? String(p.oldPrice) : null,
    promo: promoMap.get(p.id) ?? null,
    prescriptionRequired: p.prescriptionRequired,
    imageUrl: p.imageUrl,
    category: p.category?.name ?? null,
    brand: p.brand?.name ?? null,
    inStock: (similarStockMap.get(p.id) ?? 0) > 0,
  }));

  return (
    <PageContainer className="flex flex-col gap-12 py-8 pb-28 sm:py-12 sm:pb-12">
      <nav className="text-sm text-muted-foreground">
        <Link href="/shop" className="hover:text-primary">
          Do&apos;kon
        </Link>
        {product.category && (
          <>
            {" / "}
            <Link href={`/shop?category=${product.category.id}#catalog`} className="hover:text-primary">
              {product.category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/8 via-accent to-secondary portal-shadow-sm">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary external product image URL
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <Pill className="h-28 w-28 text-primary/25" />
            )}
            {product.prescriptionRequired && (
              <Badge className="absolute top-4 left-4 border-0 bg-foreground/80 text-background backdrop-blur-sm">
                Retsept talab qilinadi
              </Badge>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium text-primary">{product.brand?.name ?? product.category?.name}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
            {product.dosage && <p className="mt-1 text-muted-foreground">{product.dosage}</p>}
            <div className="mt-3 flex items-center gap-3">
              <RatingStars value={rating} />
              <Badge variant={inStock ? "secondary" : "destructive"}>{inStock ? "Mavjud" : "Tugagan"}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p
              className={
                product.oldPrice != null && Number(product.oldPrice) > Number(product.sellPrice)
                  ? "text-4xl font-bold tracking-tight text-red-600 dark:text-red-400"
                  : "text-4xl font-bold tracking-tight"
              }
            >
              {Number(product.sellPrice).toLocaleString("uz-UZ")}
              <span className="text-base font-medium text-muted-foreground"> so&apos;m / {product.unit}</span>
            </p>
            {product.oldPrice != null && Number(product.oldPrice) > Number(product.sellPrice) && (
              <span className="text-lg text-muted-foreground line-through">
                {Number(product.oldPrice).toLocaleString("uz-UZ")} so&apos;m
              </span>
            )}
          </div>
          {productPromo && (
            <Badge className="w-fit gap-1 border-0 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
              <Tag className="h-3 w-3" />
              {productPromo.code} kodi bilan -{productPromo.discountPercent}%
            </Badge>
          )}

          <div className="hidden sm:block">
            <AddToCart
              productId={product.id}
              name={product.name}
              unit={product.unit}
              sellPrice={Number(product.sellPrice)}
              prescriptionRequired={product.prescriptionRequired}
              inStock={inStock}
              size="lg"
            />
          </div>

          {!inStock && <StockAlertButton productId={product.id} />}

          <div className="grid grid-cols-3 gap-3 border-y py-4 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1.5">
              <Truck className="h-5 w-5 text-primary" />
              Tezkor yetkazish
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Original mahsulot
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <RotateCcw className="h-5 w-5 text-primary" />
              Oson qaytarish
            </div>
          </div>

          {product.description && (
            <div>
              <h2 className="mb-1.5 flex items-center gap-2 font-semibold">
                <Info className="h-4 w-4 text-primary" />
                Tavsif
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>
          )}

          <div>
            <h2 className="mb-1.5 flex items-center gap-2 font-semibold">
              <FlaskConical className="h-4 w-4 text-primary" />
              Qo&apos;llash bo&apos;yicha ma&apos;lumot
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description ??
                "Qo'llashdan oldin qadoq ichidagi yo'riqnomani diqqat bilan o'qib chiqing."}{" "}
              Dozalash va qabul qilish tartibi shifokor yoki farmatsevt ko&apos;rsatmasiga muvofiq
              belgilanadi.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
            <h2 className="mb-1.5 flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Ogohlantirish
            </h2>
            <p className="text-sm leading-relaxed text-amber-800/80 dark:text-amber-400/80">
              {product.prescriptionRequired
                ? "Ushbu dori faqat shifokor retsepti asosida sotiladi. Mustaqil qabul qilish tavsiya etilmaydi."
                : "Belgilangan dozadan oshirmang. Yon ta'sirlar yuzaga kelsa, shifokorga murojaat qiling."}{" "}
              Bolalar yetib bo&apos;lmaydigan joyda saqlang.
            </p>
          </div>

          {product.manufacturer && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Factory className="h-4 w-4" />
              Ishlab chiqaruvchi: <span className="font-medium text-foreground">{product.manufacturer.name}</span>
              {product.manufacturer.country ? ` · ${product.manufacturer.country}` : ""}
            </div>
          )}
          {product.activeIngredient && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FlaskConical className="h-4 w-4" />
              Faol modda: <span className="font-medium text-foreground">{product.activeIngredient.name}</span>
            </div>
          )}
        </div>
      </div>

      {frequentlyBoughtWith.length > 0 && (
        <div>
          <SectionHeader
            title="Ko'pincha birga xarid qilinadi"
            subtitle="Bu dori bilan birga sotib olingan mahsulotlar"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {frequentlyBoughtWith.map((p) => (
              <MedicineCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div>
          <SectionHeader title="O'xshash dorilar" subtitle="Sizga yoqishi mumkin bo'lgan mahsulotlar" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {similar.map((p) => (
              <MedicineCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <StickyAddToCart
        productId={product.id}
        name={product.name}
        unit={product.unit}
        sellPrice={Number(product.sellPrice)}
        prescriptionRequired={product.prescriptionRequired}
        inStock={inStock}
      />
    </PageContainer>
  );
}
