import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/modules/customer/components/section";
import { DoctorCard } from "@/modules/customer/components/doctor-card";

export async function PharmaMedSection() {
  const doctors = await prisma.doctor.findMany({
    where: { isActive: true },
    orderBy: { fullName: "asc" },
    take: 8,
  });
  if (doctors.length === 0) return null;

  return (
    <div id="pharmamed" className="scroll-mt-20 rounded-3xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 sm:p-10">
      <SectionHeader
        title="PharmaMed"
        subtitle="Dorixonamizning o'z shifoxonasi — malakali shifokorlardan qabulga yoziling"
        href="/pharmamed"
      />
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
    </div>
  );
}
