import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageContainer, SectionHeader } from "@/modules/customer/components/section";
import { DoctorCard } from "@/modules/customer/components/doctor-card";

export const metadata: Metadata = { title: "PharmaMed — shifokorlar" };

export default async function PharmaMedPage() {
  const doctors = await prisma.doctor.findMany({
    where: { isActive: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <PageContainer className="flex flex-col gap-6 py-8 sm:py-12">
      <SectionHeader
        title="PharmaMed shifokorlari"
        subtitle="Barcha yo'nalishdagi shifokorlarimiz — qabulga yozilish uchun tanlang"
      />
      {doctors.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Hozircha shifokorlar mavjud emas</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={{
                id: doctor.id,
                fullName: doctor.fullName,
                specialty: doctor.specialty,
                photoUrl: doctor.photoUrl,
              }}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
