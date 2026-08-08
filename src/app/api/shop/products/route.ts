import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getActivePromoMap } from "@/modules/customer/promo-map";
import { getRatingsMap } from "@/modules/customer/ratings-map";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get("search")?.trim();
  const categoryId = params.get("categoryId");
  const country = params.get("country");
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(48, Math.max(1, Number(params.get("pageSize") ?? 12)));

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(search
      ? { name: { contains: search, mode: "insensitive" } }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(country ? { manufacturer: { country } } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const stockByProduct = await prisma.batch.groupBy({
    by: ["productId"],
    where: { productId: { in: products.map((p) => p.id) }, quantity: { gt: 0 } },
    _sum: { quantity: true },
  });
  const stockMap = new Map(stockByProduct.map((s) => [s.productId, s._sum.quantity ?? 0]));
  const promoMap = await getActivePromoMap(products.map((p) => p.id));
  const ratingsMap = await getRatingsMap(products.map((p) => p.id));

  return NextResponse.json({
    data: products.map((p) => ({
      id: p.id,
      name: p.name,
      unit: p.unit,
      dosage: p.dosage,
      sellPrice: p.sellPrice,
      oldPrice: p.oldPrice,
      promo: promoMap.get(p.id) ?? null,
      rating: ratingsMap.get(p.id) ?? { avg: 0, count: 0 },
      prescriptionRequired: p.prescriptionRequired,
      imageUrl: p.imageUrl,
      description: p.description,
      category: p.category?.name ?? null,
      brand: p.brand?.name ?? null,
      inStock: (stockMap.get(p.id) ?? 0) > 0,
    })),
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  });
}
