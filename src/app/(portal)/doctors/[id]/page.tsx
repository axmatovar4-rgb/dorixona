import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Stethoscope, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/modules/customer/components/section";
import { BookAppointmentForm } from "@/modules/customer/components/book-appointment-form";
import { WEEKDAY_LABELS } from "@/lib/weekday-labels";
import { getSpecialtyInfo } from "@/lib/specialties";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const doctor = await prisma.doctor.findUnique({ where: { id }, select: { fullName: true } });
  return { title: doctor?.fullName ?? "Shifokor" };
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, doctor] = await Promise.all([
    auth(),
    prisma.doctor.findUnique({ where: { id } }),
  ]);
  if (!doctor || !doctor.isActive) notFound();
  const specialtyInfo = getSpecialtyInfo(doctor.specialty);

  return (
    <PageContainer className="flex flex-col gap-8 py-8 sm:py-12">
      <nav className="text-sm text-muted-foreground">
        <Link href="/pharmamed" className="hover:text-primary">
          PharmaMed
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{doctor.fullName}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center portal-shadow-sm lg:col-span-1">
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/10 via-accent to-secondary">
            {doctor.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary external doctor photo URL
              <img src={doctor.photoUrl} alt={doctor.fullName} className="h-full w-full object-cover" />
            ) : (
              <Stethoscope className="h-12 w-12 text-primary/40" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{doctor.fullName}</h1>
            <p className="text-muted-foreground">
              {specialtyInfo?.emoji} {doctor.specialty}
            </p>
            {specialtyInfo && <p className="mt-1 text-xs text-muted-foreground/80">{specialtyInfo.description}</p>}
          </div>
          <div className="grid w-full grid-cols-1 gap-2 text-left text-sm">
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3">
              <User className="h-4 w-4 shrink-0 text-primary" />
              <span>Yoshi: {doctor.age}</span>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="font-medium">Ish kunlari</p>
              <p className="text-muted-foreground">{doctor.workDays.map((d) => WEEKDAY_LABELS[d]).join(", ")}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="font-medium">Ish vaqti</p>
              <p className="text-muted-foreground">
                {doctor.workStartTime}–{doctor.workEndTime}
              </p>
            </div>
            {doctor.bio && (
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="font-medium">Qo&apos;shimcha</p>
                <p className="text-muted-foreground">{doctor.bio}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <BookAppointmentForm
            doctorId={doctor.id}
            workDays={doctor.workDays}
            workStartTime={doctor.workStartTime}
            workEndTime={doctor.workEndTime}
            isLoggedIn={!!session?.user && session.user.type === "CUSTOMER"}
          />
        </div>
      </div>
    </PageContainer>
  );
}
