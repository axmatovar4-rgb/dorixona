import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "pharmacy", "view")) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const search = params.get("search")?.trim();
  const categoryId = params.get("categoryId");
  const brandId = params.get("brandId");
  const manufacturerId = params.get("manufacturerId");
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize") ?? 10)));

  const where: Prisma.ProductWhereInput = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { barcode: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(manufacturerId ? { manufacturerId } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true, manufacturer: true },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const stockByProduct = await prisma.batch.groupBy({
    by: ["productId"],
    where: { productId: { in: products.map((p) => p.id) } },
    _sum: { quantity: true },
  });
  const stockMap = new Map(
    stockByProduct.map((s) => [s.productId, s._sum.quantity ?? 0])
  );

  return NextResponse.json({
    data: products.map((p) => ({ ...p, currentStock: stockMap.get(p.id) ?? 0 })),
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  });
}
