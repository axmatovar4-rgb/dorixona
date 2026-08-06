"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { sendTelegramMessage } from "@/lib/telegram";
import {
  branchSchema,
  warehouseSchema,
  stockInSchema,
  stockOutSchema,
  transferSchema,
  type BranchInput,
  type WarehouseInput,
  type StockInInput,
  type StockOutInput,
  type TransferInput,
} from "@/modules/inventory/schemas";

// ---------- Branches & Warehouses ----------

export async function createBranch(input: BranchInput) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "create")) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = branchSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.branch.create({
    data: {
      name: parsed.data.name,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
    },
  });
  revalidatePath("/inventory/branches");
  return { success: true as const };
}

export async function createWarehouse(input: WarehouseInput) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "create")) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = warehouseSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.warehouse.create({
    data: {
      name: parsed.data.name,
      location: parsed.data.location || null,
      branchId: parsed.data.branchId,
    },
  });
  revalidatePath("/inventory/warehouses");
  return { success: true as const };
}

// ---------- Stock in / out / transfer ----------

export async function stockIn(input: StockInInput) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "create")) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = stockInSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  const batch = await prisma.$transaction(async (tx) => {
    const batch = await tx.batch.create({
      data: {
        productId: data.productId,
        warehouseId: data.warehouseId,
        batchNumber: data.batchNumber,
        expiryDate: new Date(data.expiryDate),
        quantity: data.quantity,
        purchasePrice: data.purchasePrice,
        supplierName: data.supplierName || null,
      },
    });

    await tx.stockMovement.create({
      data: {
        productId: data.productId,
        batchId: batch.id,
        warehouseId: data.warehouseId,
        type: "IN",
        quantity: data.quantity,
        performedById: session.user.id,
      },
    });

    return batch;
  });

  await logAudit({
    userId: session.user.id,
    action: "STOCK_IN",
    entityType: "Batch",
    entityId: batch.id,
    changes: { quantity: data.quantity, warehouseId: data.warehouseId },
  });

  const pendingAlerts = await prisma.stockAlertSubscription.findMany({
    where: { productId: data.productId, notifiedAt: null },
    include: { customer: { select: { id: true, telegramChatId: true } } },
  });
  if (pendingAlerts.length > 0) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { name: true },
    });
    for (const alert of pendingAlerts) {
      const title = "Dori mavjud bo'ldi";
      const body = `${product?.name ?? "Mahsulot"} endi dorixonada mavjud.`;
      await createNotification({
        customerId: alert.customer.id,
        type: "BACK_IN_STOCK",
        title,
        body,
        productId: data.productId,
      });
      if (alert.customer.telegramChatId) {
        await sendTelegramMessage(alert.customer.telegramChatId, `📦 ${title}\n${body}`);
      }
      await prisma.stockAlertSubscription.update({
        where: { id: alert.id },
        data: { notifiedAt: new Date() },
      });
    }
  }

  revalidatePath("/inventory/movements");
  revalidatePath("/inventory/alerts");
  revalidatePath(`/pharmacy/products/${data.productId}`);
  return { success: true as const };
}

export async function stockOut(input: StockOutInput) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "create")) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = stockOutSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  const batch = await prisma.batch.findUnique({ where: { id: data.batchId } });
  if (!batch || batch.warehouseId !== data.warehouseId) {
    return { error: "Partiya topilmadi" };
  }
  if (batch.quantity < data.quantity) {
    return { error: `Omborda yetarli miqdor yo'q (mavjud: ${batch.quantity})` };
  }

  await prisma.$transaction([
    prisma.batch.update({
      where: { id: batch.id },
      data: { quantity: { decrement: data.quantity } },
    }),
    prisma.stockMovement.create({
      data: {
        productId: data.productId,
        batchId: batch.id,
        warehouseId: data.warehouseId,
        type: "OUT",
        quantity: data.quantity,
        reason: data.reason || null,
        performedById: session.user.id,
      },
    }),
  ]);

  await logAudit({
    userId: session.user.id,
    action: "STOCK_OUT",
    entityType: "Batch",
    entityId: batch.id,
    changes: { quantity: data.quantity, reason: data.reason },
  });

  revalidatePath("/inventory/movements");
  revalidatePath("/inventory/alerts");
  revalidatePath(`/pharmacy/products/${data.productId}`);
  return { success: true as const };
}

export async function transferStock(input: TransferInput) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "create")) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = transferSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  const sourceBatch = await prisma.batch.findUnique({ where: { id: data.batchId } });
  if (!sourceBatch || sourceBatch.warehouseId !== data.fromWarehouseId) {
    return { error: "Partiya topilmadi" };
  }
  if (sourceBatch.quantity < data.quantity) {
    return { error: `Omborda yetarli miqdor yo'q (mavjud: ${sourceBatch.quantity})` };
  }

  const transfer = await prisma.$transaction(async (tx) => {
    await tx.batch.update({
      where: { id: sourceBatch.id },
      data: { quantity: { decrement: data.quantity } },
    });

    let destBatch = await tx.batch.findFirst({
      where: {
        productId: data.productId,
        warehouseId: data.toWarehouseId,
        batchNumber: sourceBatch.batchNumber,
        expiryDate: sourceBatch.expiryDate,
      },
    });

    if (destBatch) {
      destBatch = await tx.batch.update({
        where: { id: destBatch.id },
        data: { quantity: { increment: data.quantity } },
      });
    } else {
      destBatch = await tx.batch.create({
        data: {
          productId: data.productId,
          warehouseId: data.toWarehouseId,
          batchNumber: sourceBatch.batchNumber,
          expiryDate: sourceBatch.expiryDate,
          quantity: data.quantity,
          purchasePrice: sourceBatch.purchasePrice,
          supplierName: sourceBatch.supplierName,
        },
      });
    }

    await tx.stockMovement.createMany({
      data: [
        {
          productId: data.productId,
          batchId: sourceBatch.id,
          warehouseId: data.fromWarehouseId,
          type: "TRANSFER_OUT",
          quantity: data.quantity,
          performedById: session.user.id,
        },
        {
          productId: data.productId,
          batchId: destBatch.id,
          warehouseId: data.toWarehouseId,
          type: "TRANSFER_IN",
          quantity: data.quantity,
          performedById: session.user.id,
        },
      ],
    });

    return tx.stockTransfer.create({
      data: {
        productId: data.productId,
        batchId: sourceBatch.id,
        fromWarehouseId: data.fromWarehouseId,
        toWarehouseId: data.toWarehouseId,
        quantity: data.quantity,
        status: "COMPLETED",
        createdById: session.user.id,
        completedAt: new Date(),
      },
    });
  });

  await logAudit({
    userId: session.user.id,
    action: "TRANSFER",
    entityType: "StockTransfer",
    entityId: transfer.id,
    changes: { quantity: data.quantity, from: data.fromWarehouseId, to: data.toWarehouseId },
  });

  revalidatePath("/inventory/movements");
  revalidatePath("/inventory/transfers");
  revalidatePath("/inventory/alerts");
  revalidatePath(`/pharmacy/products/${data.productId}`);
  return { success: true as const };
}

// ---------- Inventory counts (Inventarizatsiya) ----------

export async function startInventoryCount(warehouseId: string) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "create")) {
    return { error: "Sizda ruxsat yo'q" };
  }

  const batches = await prisma.batch.findMany({
    where: { warehouseId, quantity: { gt: 0 } },
  });

  const count = await prisma.inventoryCount.create({
    data: {
      warehouseId,
      createdById: session.user.id,
      items: {
        create: batches.map((b) => ({
          productId: b.productId,
          batchId: b.id,
          systemQty: b.quantity,
        })),
      },
    },
  });

  revalidatePath("/inventory/counts");
  return { success: true as const, id: count.id };
}

export async function submitCountItem(itemId: string, countedQty: number) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "edit")) {
    return { error: "Sizda ruxsat yo'q" };
  }

  const item = await prisma.inventoryCountItem.findUnique({ where: { id: itemId } });
  if (!item) return { error: "Topilmadi" };

  await prisma.inventoryCountItem.update({
    where: { id: itemId },
    data: { countedQty, diff: countedQty - item.systemQty },
  });

  revalidatePath(`/inventory/counts/${item.inventoryCountId}`);
  return { success: true as const };
}

export async function completeInventoryCount(countId: string) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "edit")) {
    return { error: "Sizda ruxsat yo'q" };
  }

  const count = await prisma.inventoryCount.findUnique({
    where: { id: countId },
    include: { items: true },
  });
  if (!count) return { error: "Topilmadi" };

  await prisma.$transaction(async (tx) => {
    for (const item of count.items) {
      if (item.countedQty === null || item.diff === 0 || item.diff === null) continue;

      await tx.batch.update({
        where: { id: item.batchId },
        data: { quantity: item.countedQty },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          batchId: item.batchId,
          warehouseId: count.warehouseId,
          type: "ADJUSTMENT",
          quantity: item.diff,
          reason: "Inventarizatsiya natijasida tuzatish",
          performedById: session.user.id,
        },
      });
    }

    await tx.inventoryCount.update({
      where: { id: countId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  });

  await logAudit({
    userId: session.user.id,
    action: "COMPLETE_COUNT",
    entityType: "InventoryCount",
    entityId: countId,
  });

  revalidatePath(`/inventory/counts/${countId}`);
  revalidatePath("/inventory/counts");
  revalidatePath("/inventory/alerts");
  return { success: true as const };
}
