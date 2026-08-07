import { z } from "zod";

export const lookupSchema = z.object({
  name: z.string().trim().min(2, "Kamida 2 ta belgi"),
});
export type LookupInput = z.infer<typeof lookupSchema>;

export const manufacturerSchema = lookupSchema.extend({
  country: z.string().trim().optional().or(z.literal("")),
});
export type ManufacturerInput = z.infer<typeof manufacturerSchema>;

export const productSchema = z.object({
  name: z.string().trim().min(2, "Nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
  barcode: z.string().trim().min(4, "Barkod kamida 4 ta belgi"),
  categoryId: z.string().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),
  manufacturerId: z.string().optional().or(z.literal("")),
  activeIngredientId: z.string().optional().or(z.literal("")),
  dosage: z.string().trim().optional().or(z.literal("")),
  unit: z.string().trim().min(1, "O'lchov birligini kiriting"),
  prescriptionRequired: z.boolean(),
  imageUrl: z.string().trim().url("To'g'ri URL kiriting").optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  purchasePrice: z.number().min(0, "Manfiy bo'lishi mumkin emas"),
  sellPrice: z.number().min(0, "Manfiy bo'lishi mumkin emas"),
  oldPrice: z.number().min(0, "Manfiy bo'lishi mumkin emas").optional().nullable(),
  minStock: z.number().int().min(0),
  maxStock: z.number().int().min(0),
  stockMethod: z.enum(["FEFO", "FIFO"]),
  isActive: z.boolean(),
});
export type ProductInput = z.infer<typeof productSchema>;
