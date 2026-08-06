import { z } from "zod";

export const payslipSchema = z.object({
  employeeId: z.string().min(1, "Xodimni tanlang"),
  month: z.string().min(1, "Oyni kiriting"),
  baseSalary: z.number().nonnegative(),
  bonuses: z.number().nonnegative(),
  deductions: z.number().nonnegative(),
});
export type PayslipInput = z.infer<typeof payslipSchema>;
