import { z } from "zod";

export const POS_PAYMENT_METHODS = ["CASH", "CARD"] as const;

export const posSaleSchema = z.object({
  paymentMethod: z.enum(POS_PAYMENT_METHODS),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Savat bo'sh"),
});
export type PosSaleInput = z.infer<typeof posSaleSchema>;
