import { prisma } from "@/lib/prisma";
import type { MedicineCardData } from "@/modules/customer/components/medicine-card";
import { getActivePromoMap } from "@/modules/customer/promo-map";
import { getRatingsMap } from "@/modules/customer/ratings-map";

export async function getFrequentlyBoughtWith(
  productId: string,
  limit = 4
): Promise<MedicineCardData[]> {
  const coOrders = await prisma.orderItem.findMany({
    where: { productId },
    select: { orderId: true },
  });
  const orderIds = coOrders.map((o) => o.orderId);
  if (orderIds.length === 0) return [];

  const companions = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { orderId: { in: orderIds }, productId: { not: productId } },
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: limit,
  });
  if (companions.length === 0) return [];

  const companionIds = companions.map((c) => c.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: companionIds }, isActive: true },
    include: { category: true, brand: true },
  });
  if (products.length === 0) return [];

  const stock = await prisma.batch.groupBy({
    by: ["productId"],
    where: { productId: { in: companionIds }, quantity: { gt: 0 } },
    _sum: { quantity: true },
  });
  const stockMap = new Map(stock.map((s) => [s.productId, s._sum.quantity ?? 0]));
  const promoMap = await getActivePromoMap(companionIds);
  const ratingsMap = await getRatingsMap(companionIds);

  const productMap = new Map(products.map((p) => [p.id, p]));
  return companionIds
    .map((id) => productMap.get(id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({
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
