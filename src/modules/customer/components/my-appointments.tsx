"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Stethoscope, CalendarX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cancelMyAppointment } from "@/modules/doctors/actions";

type Row = {
  id: string;
  scheduledAt: Date;
  status: "BOOKED" | "CANCELLED";
  doctor: { fullName: string; specialty: string; photoUrl: string | null };
};

export function MyAppointments({ appointments }: { appointments: Row[] }) {
  const router = useRouter();

  async function handleCancel(id: string) {
    const result = await cancelMyAppointment(id);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Qabul bekor qilindi");
    router.refresh();
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground portal-shadow-sm">
        <CalendarX className="h-8 w-8 text-muted-foreground/50" />
        Hali qabulga yozilmagansiz
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {appointments.map((a) => (
        <div key={a.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4 portal-shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Stethoscope className="h-4.5 w-4.5" />
          </span>
          <div className="flex-1">
            <p className="font-medium">{a.doctor.fullName}</p>
            <p className="text-xs text-muted-foreground">{a.doctor.specialty}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{format(a.scheduledAt, "dd.MM.yyyy HH:mm")}</p>
          </div>
          <Badge variant={a.status === "BOOKED" ? "secondary" : "outline"}>
            {a.status === "BOOKED" ? "Band" : "Bekor qilingan"}
          </Badge>
          {a.status === "BOOKED" && (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleCancel(a.id)}>
              Bekor qilish
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
