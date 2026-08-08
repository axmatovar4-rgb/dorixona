import { z } from "zod";

export const deliveryZoneSchema = z.object({
  name: z.string().trim().min(2, "Kamida 2 ta belgi"),
  fee: z.coerce.number().int().min(0, "0 dan kichik bo'lmasin"),
  isDefault: z.boolean().optional(),
});
export type DeliveryZoneInput = z.infer<typeof deliveryZoneSchema>;
