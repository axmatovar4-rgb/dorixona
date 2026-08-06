import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().trim().min(2, "Kategoriya kiriting"),
  amount: z.number().positive("Musbat son kiriting"),
  description: z.string().trim().optional().or(z.literal("")),
  occurredAt: z.string().min(1, "Sana kiriting"),
});
export type TransactionInput = z.infer<typeof transactionSchema>;
