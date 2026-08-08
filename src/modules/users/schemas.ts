import { z } from "zod";
import { Role } from "@prisma/client";

export const createStaffUserSchema = z.object({
  name: z.string().trim().min(2, "Kamida 2 ta belgi"),
  email: z.string().trim().email("Email noto'g'ri"),
  role: z.nativeEnum(Role),
  branchId: z.string().optional().or(z.literal("")),
});
export type CreateStaffUserInput = z.infer<typeof createStaffUserSchema>;
