import { z } from "zod";

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Yetkazib beruvchini tanlang"),
  warehouseId: z.string().min(1, "Omborni tanlang"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
      })
    )
    .min(1, "Kamida bitta mahsulot qo'shing"),
});
export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
