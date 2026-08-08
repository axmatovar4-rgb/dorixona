import { prisma } from "@/lib/prisma";

export type ProductRating = { avg: number; count: number };

export async function getRatingsMap(productIds: string[]): Promise<Map<string, ProductRating>> {
  if (productIds.length === 0) return new Map();

  const grouped = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const map = new Map<string, ProductRating>();
  for (const row of grouped) {
    map.set(row.productId, { avg: row._avg.rating ?? 0, count: row._count.rating });
  }
  return map;
}
