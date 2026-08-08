import { z } from "zod";

export const appFeedbackSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  message: z.string().trim().min(5, "Kamida 5 ta belgi").max(1000, "Ko'pi bilan 1000 ta belgi"),
});
export type AppFeedbackInput = z.infer<typeof appFeedbackSchema>;
