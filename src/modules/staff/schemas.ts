import { z } from "zod";

export const updateStaffProfileSchema = z.object({
  name: z.string().trim().min(2, "Kamida 2 ta belgi"),
});
export type UpdateStaffProfileInput = z.infer<typeof updateStaffProfileSchema>;

export const changeStaffPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Joriy parolni kiriting"),
    newPassword: z.string().min(6, "Kamida 6 ta belgi"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Parollar mos kelmadi",
    path: ["confirmPassword"],
  });
export type ChangeStaffPasswordInput = z.infer<typeof changeStaffPasswordSchema>;
