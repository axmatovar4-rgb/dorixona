import { z } from "zod";

export const promoCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Kamida 3 ta belgi")
    .max(20, "Ko'pi bilan 20 ta belgi")
    .regex(/^[A-Za-z0-9]+$/, "Faqat lotin harflari va raqamlar"),
  discountPercent: z.coerce.number().int().min(1, "Kamida 1%").max(90, "Ko'pi bilan 90%"),
});
export type PromoCodeInput = z.infer<typeof promoCodeSchema>;
