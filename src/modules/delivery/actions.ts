"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { logAudit } from "@/lib/audit";
import { deliveryZoneSchema, type DeliveryZoneInput } from "@/modules/delivery/schemas";

async function clearOtherDefaults(exceptId?: string) {
  await prisma.deliveryZone.updateMany({
    where: exceptId ? { id: { not: exceptId } } : {},
    data: { isDefault: false },
  });
}

export async function createDeliveryZone(input: DeliveryZoneInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "deliveryZones", "create"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = deliveryZoneSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const count = await prisma.deliveryZone.count();
  const zone = await prisma.deliveryZone.create({
    data: {
      name: parsed.data.name,
      fee: parsed.data.fee,
      isDefault: count === 0 ? true : !!parsed.data.isDefault,
      sortOrder: count,
    },
  });
  if (zone.isDefault) await clearOtherDefaults(zone.id);

  await logAudit({ userId: session.user.id, action: "CREATE", entityType: "DeliveryZone", entityId: zone.id });
  revalidatePath("/delivery-zones");
  revalidatePath("/checkout");
  return { success: true as const };
}

export async function updateDeliveryZone(id: string, input: DeliveryZoneInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "deliveryZones", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = deliveryZoneSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  await prisma.deliveryZone.update({
    where: { id },
    data: { name: parsed.data.name, fee: parsed.data.fee, isDefault: !!parsed.data.isDefault },
  });
  if (parsed.data.isDefault) await clearOtherDefaults(id);

  await logAudit({ userId: session.user.id, action: "UPDATE", entityType: "DeliveryZone", entityId: id });
  revalidatePath("/delivery-zones");
  revalidatePath("/checkout");
  return { success: true as const };
}

export async function toggleDeliveryZoneActive(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "deliveryZones", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.deliveryZone.update({ where: { id }, data: { isActive } });
  revalidatePath("/delivery-zones");
  revalidatePath("/checkout");
  return { success: true as const };
}

export async function deleteDeliveryZone(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "deliveryZones", "delete"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.deliveryZone.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "DELETE", entityType: "DeliveryZone", entityId: id });
  revalidatePath("/delivery-zones");
  revalidatePath("/checkout");
  return { success: true as const };
}
