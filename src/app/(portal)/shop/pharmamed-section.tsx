import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/modules/customer/components/section";
import { DoctorCard } from "@/modules/customer/components/doctor-card";
import { Marquee } from "@/components/marquee";

export async function PharmaMedSection() {
  const doctors = await prisma.doctor.findMany({
    where: { isActive: true },
    orderBy: { fullName: "asc" },
    take: 12,
  });
  if (doctors.length === 0) return null;

  return (
    <div id="pharmamed" className="scroll-mt-20">
      <SectionHeader
        title="PharmaMed"
        subtitle="Dorixonamizning o'z shifoxonasi — malakali shifokorlardan qabulga yoziling"
        href="/pharmamed"
      />
      <Marquee durationSeconds={doctors.length * 5}>
        {doctors.map((doctor) => (
          <div key={doctor.id} className="w-44 sm:w-52">
            <DoctorCard
              doctor={{
                id: doctor.id,
                fullName: doctor.fullName,
                specialty: doctor.specialty,
                photoUrl: doctor.photoUrl,
              }}
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
