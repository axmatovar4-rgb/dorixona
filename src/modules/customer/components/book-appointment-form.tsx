"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarPlus, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WEEKDAY_LABELS } from "@/lib/weekday-labels";
import type { Weekday } from "@prisma/client";
import { bookAppointment } from "@/modules/doctors/actions";

export function BookAppointmentForm({
  doctorId,
  workDays,
  workStartTime,
  workEndTime,
  isLoggedIn,
}: {
  doctorId: string;
  workDays: Weekday[];
  workStartTime: string;
  workEndTime: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState(workStartTime);
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">Qabulga yozilish uchun tizimga kiring</p>
        <Button className="gap-1.5 rounded-full" render={<Link href={`/login?callbackUrl=/doctors/${doctorId}`} />}>
          <LogIn className="h-4 w-4" />
          Tizimga kirish
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time) {
      toast.error("Sana va vaqtni tanlang");
      return;
    }
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const scheduledAt = new Date(y, m - 1, d, hh, mm);

    setSubmitting(true);
    const result = await bookAppointment(doctorId, scheduledAt.toISOString(), note);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Qabulga yozildingiz!");
    setDate("");
    setNote("");
    router.push("/account/appointments");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border bg-card p-5 portal-shadow-sm">
      <h3 className="flex items-center gap-1.5 font-semibold">
        <CalendarPlus className="h-4 w-4 text-primary" />
        Qabulga yozilish
      </h3>
      <p className="text-xs text-muted-foreground">
        Ish kunlari: {workDays.map((d) => WEEKDAY_LABELS[d]).join(", ")} · Ish vaqti: {workStartTime}–{workEndTime}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Sana</Label>
          <Input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} required className="rounded-xl" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Vaqt</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="rounded-xl" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Izoh (ixtiyoriy)</Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Shikoyatingiz haqida qisqacha" className="rounded-xl" />
      </div>
      <Button type="submit" disabled={submitting} className="mt-1 gap-1.5 rounded-full">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Yozilish
      </Button>
    </form>
  );
}
