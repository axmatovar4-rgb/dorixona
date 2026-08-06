import { z } from "zod";

export const branchSchema = z.object({
  name: z.string().trim().min(2, "Kamida 2 ta belgi"),
  address: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
});
export type BranchInput = z.infer<typeof branchSchema>;

export const warehouseSchema = z.object({
  name: z.string().trim().min(2, "Kamida 2 ta belgi"),
  location: z.string().trim().optional().or(z.literal("")),
  branchId: z.string().min(1, "Filialni tanlang"),
});
export type WarehouseInput = z.infer<typeof warehouseSchema>;

export const stockInSchema = z.object({
  productId: z.string().min(1, "Mahsulotni tanlang"),
  warehouseId: z.string().min(1, "Omborni tanlang"),
  batchNumber: z.string().trim().min(1, "Partiya raqamini kiriting"),
  expiryDate: z.string().min(1, "Muddatni kiriting"),
  quantity: z.number().int().positive("Miqdor 0 dan katta bo'lishi kerak"),
  purchasePrice: z.number().min(0, "Manfiy bo'lishi mumkin emas"),
  supplierName: z.string().trim().optional().or(z.literal("")),
});
export type StockInInput = z.infer<typeof stockInSchema>;

export const stockOutSchema = z.object({
  productId: z.string().min(1, "Mahsulotni tanlang"),
  warehouseId: z.string().min(1, "Omborni tanlang"),
  batchId: z.string().min(1, "Partiyani tanlang"),
  quantity: z.number().int().positive("Miqdor 0 dan katta bo'lishi kerak"),
  reason: z.string().trim().optional().or(z.literal("")),
});
export type StockOutInput = z.infer<typeof stockOutSchema>;

export const transferSchema = z.object({
  productId: z.string().min(1, "Mahsulotni tanlang"),
  batchId: z.string().min(1, "Partiyani tanlang"),
  fromWarehouseId: z.string().min(1, "Manba omborni tanlang"),
  toWarehouseId: z.string().min(1, "Qabul qiluvchi omborni tanlang"),
  quantity: z.number().int().positive("Miqdor 0 dan katta bo'lishi kerak"),
}).refine((d) => d.fromWarehouseId !== d.toWarehouseId, {
  message: "Manba va qabul qiluvchi ombor bir xil bo'lmasligi kerak",
  path: ["toWarehouseId"],
});
export type TransferInput = z.infer<typeof transferSchema>;
