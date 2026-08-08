import Link from "next/link";
import { Stethoscope, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export type DoctorCardData = {
  id: string;
  fullName: string;
  specialty: string;
  photoUrl: string | null;
};

export function DoctorCard({ doctor }: { doctor: DoctorCardData }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center portal-shadow-sm transition-all duration-300 hover:-translate-y-1 hover:portal-shadow">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/10 via-accent to-secondary">
        {doctor.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary external doctor photo URL
          <img src={doctor.photoUrl} alt={doctor.fullName} className="h-full w-full object-cover" />
        ) : (
          <Stethoscope className="h-9 w-9 text-primary/40" />
        )}
      </div>
      <div>
        <p className="font-semibold leading-tight">{doctor.fullName}</p>
        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
      </div>
      <Button variant="outline" size="sm" className="gap-1.5 rounded-full" render={<Link href={`/doctors/${doctor.id}`} />}>
        <Eye className="h-3.5 w-3.5" />
        Ko&apos;rish
      </Button>
    </div>
  );
}
