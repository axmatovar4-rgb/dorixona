import { z } from "zod";

export const invoiceSchema = z.object({
  type: z.enum(["SALES", "PURCHASE"]),
  partyName: z.string().trim().min(2, "Nomini kiriting"),
  amount: z.number().positive("Musbat son kiriting"),
  dueDate: z.string().optional().or(z.literal("")),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;
