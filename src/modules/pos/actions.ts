"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { posSaleSchema, type PosSaleInput } from "@/modules/pos/schemas";

export async function lookupProductByBarcode(barcode: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !can(session.user.role, "sales", "create")) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const product = await prisma.product.findUnique({
    where: { barcode: barcode.trim() },
    include: { batches: { select: { quantity: true } } },
  });
  if (!product || !product.isActive) {
    return { error: "Bu shtrix-kodga mos dori topilmadi" };
  }
  const inStock = product.batches.reduce((sum, b) => sum + b.quantity, 0);
  return {
    success: true as const,
    product: {
      id: product.id,
      name: product.name,
      dosage: product.dosage,
      unit: product.unit,
      sellPrice: Number(product.sellPrice),
      inStock,
    },
  };
}

export async function createPosSale(input: PosSaleInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !can(session.user.role, "sales", "create")) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = posSaleSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  const { paymentMethod, items } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, isActive: true },
  });
  if (products.length !== items.length) {
    return { error: "Ba'zi mahsulotlar endi mavjud emas" };
  }

  let subtotal = 0;
  const saleItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const unitPrice = Number(product.sellPrice);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    return { productId: product.id, quantity: item.quantity, unitPrice, lineTotal };
  });

  const cashier = await prisma.user.findUnique({ where: { id: session.user.id }, select: { branchId: true } });

  try {
    const saleId = await prisma.$transaction(async (tx) => {
      const sale = await tx.posSale.create({
        data: {
          cashierId: session.user.id,
          branchId: cashier?.branchId ?? null,
          subtotal,
          total: subtotal,
          paymentMethod,
          items: { create: saleItems },
        },
        include: { items: true },
      });

      for (const saleItem of sale.items) {
        let remaining = saleItem.quantity;
        const batches = await tx.batch.findMany({
          where: { productId: saleItem.productId, quantity: { gt: 0 } },
          orderBy: { expiryDate: "asc" },
        });

        for (const batch of batches) {
          if (remaining <= 0) break;
          const take = Math.min(remaining, batch.quantity);

          await tx.batch.update({ where: { id: batch.id }, data: { quantity: { decrement: take } } });
          await tx.stockMovement.create({
            data: {
              productId: saleItem.productId,
              batchId: batch.id,
              warehouseId: batch.warehouseId,
              type: "OUT",
              quantity: take,
              reason: `Do'kondagi tezkor sotuv #${sale.id.slice(-8).toUpperCase()}`,
              performedById: session.user.id,
            },
          });
          remaining -= take;
        }

        if (remaining > 0) {
          throw new Error(`INSUFFICIENT_STOCK:${saleItem.productId}`);
        }
      }

      return sale.id;
    }, { timeout: 20000 });

    revalidatePath("/pos");
    return { success: true as const, saleId };
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("INSUFFICIENT_STOCK:")) {
      const productId = err.message.split(":")[1];
      const product = products.find((p) => p.id === productId);
      return { error: `${product?.name ?? "Mahsulot"} yetarli miqdorda mavjud emas` };
    }
    throw err;
  }
}
