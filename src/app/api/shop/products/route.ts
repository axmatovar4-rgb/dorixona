import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get("search")?.trim();
  const categoryId = params.get("categoryId");
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(48, Math.max(1, Number(params.get("pageSize") ?? 12)));

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(search
      ? { name: { contains: search, mode: "insensitive" } }
      : {}),
    ...(categoryId ? { categoryId } : {}),
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

  return NextResponse.json({
    data: products.map((p) => ({
      id: p.id,
      name: p.name,
      unit: p.unit,
      dosage: p.dosage,
      sellPrice: p.sellPrice,
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
