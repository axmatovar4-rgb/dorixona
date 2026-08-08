import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "Kamida 2 ta belgi"),
    lastName: z.string().trim().min(2, "Kamida 2 ta belgi"),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{9,15}$/, "To'g'ri telefon raqam kiriting (masalan: +998901234567)"),
    address: z.string().trim().optional().or(z.literal("")),
    password: z.string().min(6, "Kamida 6 ta belgi"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Parollar mos kelmadi",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2, "Kamida 2 ta belgi"),
  lastName: z.string().trim().min(2, "Kamida 2 ta belgi"),
  address: z.string().trim().optional().or(z.literal("")),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const addressSchema = z.object({
  label: z.string().trim().optional().or(z.literal("")),
  fullAddress: z.string().trim().min(5, "To'liq manzilni kiriting"),
  isDefault: z.boolean(),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const PAYMENT_METHODS = ["CASH_ON_DELIVERY", "CLICK", "PAYME", "UZCARD", "HUMO", "VISA"] as const;

export const DELIVERY_METHODS = ["DELIVERY", "PICKUP"] as const;

export const checkoutSchema = z
  .object({
    deliveryMethod: z.enum(DELIVERY_METHODS),
    addressId: z.string().optional().or(z.literal("")),
    pickupBranchId: z.string().optional().or(z.literal("")),
    paymentMethod: z.enum(PAYMENT_METHODS),
    courierNote: z.string().trim().max(300, "Ko'pi bilan 300 ta belgi").optional().or(z.literal("")),
    promoCode: z.string().trim().max(20).optional().or(z.literal("")),
    deliveryZoneId: z.string().optional().or(z.literal("")),
    items: z
      .array(
        z.object({
          productId: z.string(),
          quantity: z.number().int().positive(),
        })
      )
      .min(1, "Savat bo'sh"),
  })
  .refine((d) => d.deliveryMethod !== "DELIVERY" || !!d.addressId, {
    message: "Manzilni tanlang",
    path: ["addressId"],
  })
  .refine((d) => d.deliveryMethod !== "PICKUP" || !!d.pickupBranchId, {
    message: "Filialni tanlang",
    path: ["pickupBranchId"],
  });
export type CheckoutInput = z.infer<typeof checkoutSchema>;
