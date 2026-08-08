"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { logAudit } from "@/lib/audit";
import { doctorSchema, type DoctorInput } from "@/modules/doctors/schemas";

export async function createDoctor(input: DoctorInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "doctors", "create"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = doctorSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  const doctor = await prisma.doctor.create({
    data: {
      fullName: parsed.data.fullName,
      specialty: parsed.data.specialty,
      age: parsed.data.age,
      photoUrl: parsed.data.photoUrl || null,
      bio: parsed.data.bio || null,
      workDays: parsed.data.workDays,
      workStartTime: parsed.data.workStartTime,
      workEndTime: parsed.data.workEndTime,
    },
  });

  await logAudit({ userId: session.user.id, action: "CREATE", entityType: "Doctor", entityId: doctor.id });
  revalidatePath("/doctors");
  revalidatePath("/shop");
  return { success: true as const };
}

export async function updateDoctor(id: string, input: DoctorInput) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "doctors", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  const parsed = doctorSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  await prisma.doctor.update({
    where: { id },
    data: {
      fullName: parsed.data.fullName,
      specialty: parsed.data.specialty,
      age: parsed.data.age,
      photoUrl: parsed.data.photoUrl || null,
      bio: parsed.data.bio || null,
      workDays: parsed.data.workDays,
      workStartTime: parsed.data.workStartTime,
      workEndTime: parsed.data.workEndTime,
    },
  });

  await logAudit({ userId: session.user.id, action: "UPDATE", entityType: "Doctor", entityId: id });
  revalidatePath("/doctors");
  revalidatePath("/shop");
  return { success: true as const };
}

export async function toggleDoctorActive(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "doctors", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.doctor.update({ where: { id }, data: { isActive } });
  revalidatePath("/doctors");
  revalidatePath("/shop");
  return { success: true as const };
}

export async function cancelAppointmentStaff(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "doctors", "edit"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/appointments");
  return { success: true as const };
}

export async function deleteDoctor(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !(await canAsync(session.user.role, "doctors", "delete"))) {
    return { error: "Sizda ruxsat yo'q" };
  }
  await prisma.doctor.delete({ where: { id } });
  await logAudit({ userId: session.user.id, action: "DELETE", entityType: "Doctor", entityId: id });
  revalidatePath("/doctors");
  revalidatePath("/shop");
  return { success: true as const };
}

// ---------- Customer-facing ----------

export async function bookAppointment(doctorId: string, scheduledAtISO: string, note?: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Qabulga yozilish uchun tizimga kiring" };
  }

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor || !doctor.isActive) {
    return { error: "Shifokor topilmadi" };
  }

  const scheduledAt = new Date(scheduledAtISO);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
    return { error: "Sana/vaqtni to'g'ri tanlang" };
  }

  const WEEKDAY_BY_JS_DAY = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;
  const weekday = WEEKDAY_BY_JS_DAY[scheduledAt.getDay()];
  if (!doctor.workDays.includes(weekday)) {
    return { error: "Shifokor bu kuni ishlamaydi" };
  }

  const hhmm = `${String(scheduledAt.getHours()).padStart(2, "0")}:${String(scheduledAt.getMinutes()).padStart(2, "0")}`;
  if (hhmm < doctor.workStartTime || hhmm >= doctor.workEndTime) {
    return { error: `Shifokorning ish vaqti: ${doctor.workStartTime}–${doctor.workEndTime}` };
  }

  try {
    const appointment = await prisma.appointment.create({
      data: { doctorId, customerId: session.user.id, scheduledAt, note: note || null },
    });
    revalidatePath("/account/appointments");
    revalidatePath("/appointments");
    return { success: true as const, appointmentId: appointment.id };
  } catch {
    return { error: "Bu vaqt band qilingan, boshqa vaqt tanlang" };
  }
}

export async function getMyAppointments() {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") return [];
  return prisma.appointment.findMany({
    where: { customerId: session.user.id },
    orderBy: { scheduledAt: "desc" },
    include: { doctor: { select: { fullName: true, specialty: true, photoUrl: true } } },
  });
}

export async function cancelMyAppointment(id: string) {
  const session = await auth();
  if (!session?.user || session.user.type !== "CUSTOMER") {
    return { error: "Sizda ruxsat yo'q" };
  }
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment || appointment.customerId !== session.user.id) {
    return { error: "Qabul topilmadi" };
  }
  await prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/account/appointments");
  return { success: true as const };
}
