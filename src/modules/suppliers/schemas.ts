import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().trim().min(2, "Kamida 2 ta belgi"),
  contactPerson: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
});
export type SupplierInput = z.infer<typeof supplierSchema>;
