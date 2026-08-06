import { z } from "zod";

export const employeeSchema = z.object({
  fullName: z.string().trim().min(2, "Kamida 2 ta belgi"),
  position: z.string().trim().min(2, "Lavozimni kiriting"),
  department: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().optional().or(z.literal("")),
  hireDate: z.string().min(1, "Ishga kirgan sanani kiriting"),
  salary: z.number().nonnegative("Manfiy bo'lmasin"),
});
export type EmployeeInput = z.infer<typeof employeeSchema>;
