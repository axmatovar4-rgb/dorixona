import { prisma } from "@/lib/prisma";

export type ProductPromo = { code: string; discountPercent: number };

export async function getActivePromoMap(productIds: string[]): Promise<Map<string, ProductPromo>> {
  if (productIds.length === 0) return new Map();

  const promoCodes = await prisma.promoCode.findMany({
    where: { isActive: true, products: { some: { id: { in: productIds } } } },
    include: { products: { select: { id: true } } },
  });

  const map = new Map<string, ProductPromo>();
  for (const promo of promoCodes) {
    for (const product of promo.products) {
      const existing = map.get(product.id);
      if (!existing || promo.discountPercent > existing.discountPercent) {
        map.set(product.id, { code: promo.code, discountPercent: promo.discountPercent });
      }
    }
  }
  return map;
}
