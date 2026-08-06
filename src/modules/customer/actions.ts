"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, auth } from "@/lib/auth";
import {
  registerSchema,
  updateProfileSchema,
  addressSchema,
  checkoutSchema,
  type RegisterInput,
  type UpdateProfileInput,
  type AddressInput,
  type CheckoutInput,
} from "@/modules/customer/schemas";
import { DELIVERY_FEE } from "@/modules/customer/constants";
import { listNotifications, getUnreadCount, markAllRead } from "@/lib/notifications";

export async function registerCustomer(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }
  const { firstName, lastName, phone, address, password } = parsed.data;

  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) {
    return { error: "Bu telefon raqami bilan hisob allaqachon mavjud" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.customer.create({
    data: { firstName, lastName, phone, address: address || null, passwordHash },
  });

  try {
    await signIn("credentials", { identifier: phone, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Ro'yxatdan o'tildi, lekin avtomatik kirishda xatolik yuz berdi. Iltimos qo'lda kiring.",
      };
    }
    throw error;
  }

  redirect("/account");
}

export async function updateProfile(input: UpdateProfileInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Sizda ruxsat yo'q" };
  }

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  await prisma.customer.update({
    where: { id: session.user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      address: parsed.data.address || null,
    },
  });

  revalidatePath("/account");
  return { success: true as const };
}

// ---------- Addresses ----------

export async function createAddress(input: AddressInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.address.updateMany({
        where: { customerId: session.user.id },
        data: { isDefault: false },
      });
    }
    await tx.address.create({
      data: {
        customerId: session.user.id,
        label: parsed.data.label || null,
        fullAddress: parsed.data.fullAddress,
        isDefault: parsed.data.isDefault,
      },
    });
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true as const };
}

export async function deleteAddress(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Sizda ruxsat yo'q" };
  }

  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.customerId !== session.user.id) {
    return { error: "Manzil topilmadi" };
  }

  const usedInOrder = await prisma.order.count({ where: { addressId: id } });
  if (usedInOrder > 0) {
    return { error: "Bu manzil buyurtmalarda ishlatilgan, o'chirib bo'lmaydi" };
  }

  await prisma.address.delete({ where: { id } });
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true as const };
}

export async function setDefaultAddress(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Sizda ruxsat yo'q" };
  }

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { customerId: session.user.id },
      data: { isDefault: false },
    }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true as const };
}

// ---------- Orders ----------

export async function createOrder(input: CheckoutInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Sizda ruxsat yo'q" };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }
  const { addressId, paymentMethod, items } = parsed.data;

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.customerId !== session.user.id) {
    return { error: "Manzil topilmadi" };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, isActive: true },
  });
  if (products.length !== items.length) {
    return { error: "Ba'zi mahsulotlar endi mavjud emas" };
  }

  const requiresPrescription = products.some((p) => p.prescriptionRequired);

  let subtotal = 0;
  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const unitPrice = Number(product.sellPrice);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    return {
      productId: product.id,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    };
  });
  const total = subtotal + DELIVERY_FEE;

  let orderId: string;
  try {
    orderId = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId: session.user.id,
          addressId,
          paymentMethod,
          subtotal,
          deliveryFee: DELIVERY_FEE,
          total,
          requiresPrescription,
          items: { create: orderItems },
        },
        include: { items: true },
      });

      for (const orderItem of order.items) {
        let remaining = orderItem.quantity;
        const batches = await tx.batch.findMany({
          where: { productId: orderItem.productId, quantity: { gt: 0 } },
          orderBy: { expiryDate: "asc" },
        });

        for (const batch of batches) {
          if (remaining <= 0) break;
          const take = Math.min(remaining, batch.quantity);

          await tx.batch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: take } },
          });
          await tx.stockMovement.create({
            data: {
              productId: orderItem.productId,
              batchId: batch.id,
              warehouseId: batch.warehouseId,
              type: "OUT",
              quantity: take,
              reason: `Onlayn buyurtma #${order.id.slice(-8).toUpperCase()}`,
              performedById: null,
            },
          });
          await tx.orderItemBatch.create({
            data: { orderItemId: orderItem.id, batchId: batch.id, quantity: take },
          });

          remaining -= take;
        }

        if (remaining > 0) {
          throw new Error(`INSUFFICIENT_STOCK:${orderItem.productId}`);
        }
      }

      return order.id;
    }, { timeout: 20000 });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("INSUFFICIENT_STOCK:")) {
      const productId = err.message.split(":")[1];
      const product = products.find((p) => p.id === productId);
      return { error: `${product?.name ?? "Mahsulot"} yetarli miqdorda mavjud emas` };
    }
    throw err;
  }

  revalidatePath("/orders");
  return { success: true as const, orderId };
}

// ---------- Notifications ----------

export async function getMyNotifications() {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { notifications: [], unreadCount: 0 };
  }
  const [notifications, unreadCount] = await Promise.all([
    listNotifications(session.user.id),
    getUnreadCount(session.user.id),
  ]);
  return { notifications, unreadCount };
}

export async function markNotificationsRead() {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") return;
  await markAllRead(session.user.id);
  revalidatePath("/shop");
}

// ---------- Telegram linking ----------

export async function generateTelegramLinkToken() {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Sizda ruxsat yo'q" };
  }
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    return { error: "Telegram bot hozircha sozlanmagan" };
  }
  const token = crypto.randomUUID();
  await prisma.customer.update({
    where: { id: session.user.id },
    data: { telegramLinkToken: token },
  });
  return { success: true as const, url: `https://t.me/${botUsername}?start=${token}` };
}

export async function unlinkTelegram() {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.customer.update({
    where: { id: session.user.id },
    data: { telegramChatId: null, telegramLinkToken: null },
  });
  revalidatePath("/account");
  return { success: true as const };
}

// ---------- Stock alerts ----------

export async function subscribeToStockAlert(productId: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Sizda ruxsat yo'q" };
  }

  const existing = await prisma.stockAlertSubscription.findFirst({
    where: { customerId: session.user.id, productId, notifiedAt: null },
  });
  if (existing) {
    return { success: true as const, alreadySubscribed: true };
  }

  await prisma.stockAlertSubscription.create({
    data: { customerId: session.user.id, productId },
  });
  return { success: true as const, alreadySubscribed: false };
}

// ---------- Reorder ----------

export async function reorderItems(orderId: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Sizda ruxsat yo'q" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order || order.customerId !== session.user.id) {
    return { error: "Buyurtma topilmadi" };
  }

  const items = order.items
    .filter((item) => item.product.isActive)
    .map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      unit: item.product.unit,
      sellPrice: Number(item.product.sellPrice),
      prescriptionRequired: item.product.prescriptionRequired,
      quantity: item.quantity,
    }));

  const skipped = order.items
    .filter((item) => !item.product.isActive)
    .map((item) => item.product.name);

  if (items.length === 0) {
    return { error: "Bu buyurtmadagi mahsulotlar endi mavjud emas" };
  }

  return { success: true as const, items, skipped };
}
