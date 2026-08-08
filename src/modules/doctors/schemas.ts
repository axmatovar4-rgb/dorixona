import { z } from "zod";

export const WEEKDAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const doctorSchema = z.object({
  fullName: z.string().trim().min(2, "Kamida 2 ta belgi"),
  specialty: z.string().trim().min(2, "Kamida 2 ta belgi"),
  age: z.coerce.number().int().min(20, "20 dan katta bo'lishi kerak").max(90, "90 dan kichik bo'lishi kerak"),
  photoUrl: z.string().trim().optional().or(z.literal("")),
  bio: z.string().trim().optional().or(z.literal("")),
  workDays: z.array(z.enum(WEEKDAYS)).min(1, "Kamida bitta ish kunini tanlang"),
  workStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Vaqtni to'g'ri kiriting (masalan 09:00)"),
  workEndTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Vaqtni to'g'ri kiriting (masalan 18:00)"),
});
export type DoctorInput = z.infer<typeof doctorSchema>;
