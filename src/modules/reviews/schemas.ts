import { z } from "zod";

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Baho tanlang").max(5),
  comment: z.string().trim().max(500, "Ko'pi bilan 500 ta belgi").optional().or(z.literal("")),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
