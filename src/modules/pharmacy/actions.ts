"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import {
  lookupSchema,
  manufacturerSchema,
  productSchema,
  type ProductInput,
} from "@/modules/pharmacy/schemas";

export async function createProduct(input: ProductInput) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "pharmacy", "create")) {
    return { error: "Sizda ruxsat yo'q" };
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  const data = toPrismaData(parsed.data);

  let productId: string;
  try {
    const product = await prisma.product.create({ data });
    productId = product.id;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Bu barkod bilan mahsulot allaqachon mavjud" };
    }
    throw error;
  }

  await logAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "Product",
    entityId: productId,
    changes: data as Prisma.InputJsonValue,
  });

  revalidatePath("/pharmacy/products");
  return { success: true as const, id: productId };
}

export async function updateProduct(productId: string, input: ProductInput) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "pharmacy", "edit")) {
    return { error: "Sizda ruxsat yo'q" };
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  const data = toPrismaData(parsed.data);

  try {
    await prisma.product.update({ where: { id: productId }, data });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Bu barkod bilan mahsulot allaqachon mavjud" };
    }
    throw error;
  }

  await logAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "Product",
    entityId: productId,
    changes: data as Prisma.InputJsonValue,
  });

  revalidatePath("/pharmacy/products");
  revalidatePath(`/pharmacy/products/${productId}`);
  return { success: true as const, id: productId };
}

function toPrismaData(data: ProductInput) {
  return {
    name: data.name,
    barcode: data.barcode,
    categoryId: data.categoryId || null,
    brandId: data.brandId || null,
    manufacturerId: data.manufacturerId || null,
    activeIngredientId: data.activeIngredientId || null,
    dosage: data.dosage || null,
    unit: data.unit,
    prescriptionRequired: data.prescriptionRequired,
    imageUrl: data.imageUrl || null,
    description: data.description || null,
    purchasePrice: data.purchasePrice,
    sellPrice: data.sellPrice,
    oldPrice: data.oldPrice || null,
    minStock: data.minStock,
    maxStock: data.maxStock,
    stockMethod: data.stockMethod,
    isActive: data.isActive,
  } satisfies Prisma.ProductUncheckedUpdateInput;
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "pharmacy", "delete")) {
    throw new Error("Sizda ruxsat yo'q");
  }

  await prisma.product.update({ where: { id: productId }, data: { isActive } });

  await logAudit({
    userId: session.user.id,
    action: isActive ? "ACTIVATE" : "DEACTIVATE",
    entityType: "Product",
    entityId: productId,
  });

  revalidatePath("/pharmacy/products");
}

// ---------- Lookups (Category / Brand / Manufacturer / ActiveIngredient) ----------

type LookupModel = "category" | "brand" | "manufacturer" | "activeIngredient";

export async function createLookup(model: LookupModel, formData: FormData) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "pharmacy", "create")) {
    return "Sizda ruxsat yo'q";
  }

  if (model === "manufacturer") {
    const parsed = manufacturerSchema.safeParse({
      name: formData.get("name"),
      country: formData.get("country"),
    });
    if (!parsed.success) return parsed.error.issues[0]?.message;
    await prisma.manufacturer.create({
      data: { name: parsed.data.name, country: parsed.data.country || null },
    });
  } else {
    const parsed = lookupSchema.safeParse({ name: formData.get("name") });
    if (!parsed.success) return parsed.error.issues[0]?.message;

    switch (model) {
      case "category":
        await prisma.category.create({ data: { name: parsed.data.name } });
        break;
      case "brand":
        await prisma.brand.create({ data: { name: parsed.data.name } });
        break;
      case "activeIngredient":
        await prisma.activeIngredient.create({ data: { name: parsed.data.name } });
        break;
    }
  }

  revalidatePath("/pharmacy/catalog");
}

export async function deleteLookup(model: LookupModel, id: string) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "pharmacy", "delete")) {
    return "Sizda ruxsat yo'q";
  }

  const inUse = await prisma.product.count({
    where: { [`${model}Id`]: id },
  });
  if (inUse > 0) {
    return "Bu element mahsulotlarda ishlatilmoqda, o'chirib bo'lmaydi";
  }

  switch (model) {
    case "category":
      await prisma.category.delete({ where: { id } });
      break;
    case "brand":
      await prisma.brand.delete({ where: { id } });
      break;
    case "manufacturer":
      await prisma.manufacturer.delete({ where: { id } });
      break;
    case "activeIngredient":
      await prisma.activeIngredient.delete({ where: { id } });
      break;
  }

  revalidatePath("/pharmacy/catalog");
}
