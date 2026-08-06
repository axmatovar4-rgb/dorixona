import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendTelegramMessage } from "@/lib/telegram";

const THRESHOLDS = [30, 15, 7];

export async function checkExpiryForCustomer(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { telegramChatId: true },
  });
  if (!customer) return;

  const now = new Date();
  const maxWindow = new Date(now);
  maxWindow.setDate(maxWindow.getDate() + Math.max(...THRESHOLDS));

  const orderItemBatches = await prisma.orderItemBatch.findMany({
    where: {
      orderItem: { order: { customerId } },
      batch: { expiryDate: { gte: now, lte: maxWindow } },
    },
    include: { batch: { include: { product: true } } },
  });

  for (const oib of orderItemBatches) {
    const daysUntilExpiry = Math.floor(
      (oib.batch.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const threshold of THRESHOLDS) {
      if (daysUntilExpiry > threshold) continue;

      try {
        await prisma.expiryNotification.create({
          data: { orderItemBatchId: oib.id, thresholdDays: threshold },
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          continue; // already notified for this threshold
        }
        throw err;
      }

      const productName = oib.batch.product.name;
      const title = "Dori muddati tugayapti";
      const body = `${productName} — ${daysUntilExpiry} kundan so'ng yaroqlilik muddati tugaydi.`;
      await createNotification({
        customerId,
        type: "EXPIRY_WARNING",
        title,
        body,
        productId: oib.batch.product.id,
      });
      if (customer.telegramChatId) {
        await sendTelegramMessage(customer.telegramChatId, `⏰ ${title}\n${body}`);
      }
    }
  }
}
