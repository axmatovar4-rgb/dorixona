"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cancelAppointmentStaff } from "@/modules/doctors/actions";

type Row = {
  id: string;
  scheduledAt: Date;
  status: "BOOKED" | "CANCELLED";
  note: string | null;
  doctor: { fullName: string; specialty: string };
  customer: { firstName: string; lastName: string; phone: string };
};

export function AppointmentsTable({ appointments, canManage }: { appointments: Row[]; canManage: boolean }) {
  const router = useRouter();

  async function handleCancel(id: string) {
    const result = await cancelAppointmentStaff(id);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Qabul bekor qilindi");
    router.refresh();
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mijoz</TableHead>
          <TableHead>Shifokor</TableHead>
          <TableHead>Sana / vaqt</TableHead>
          <TableHead>Holat</TableHead>
          {canManage && <TableHead className="w-10" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
              Qabullar mavjud emas
            </TableCell>
          </TableRow>
        ) : (
          appointments.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">
                {a.customer.firstName} {a.customer.lastName}
                <div className="text-xs text-muted-foreground">{a.customer.phone}</div>
              </TableCell>
              <TableCell>
                {a.doctor.fullName}
                <div className="text-xs text-muted-foreground">{a.doctor.specialty}</div>
              </TableCell>
              <TableCell>{format(a.scheduledAt, "dd.MM.yyyy HH:mm")}</TableCell>
              <TableCell>
                <Badge variant={a.status === "BOOKED" ? "secondary" : "outline"}>
                  {a.status === "BOOKED" ? "Band qilingan" : "Bekor qilingan"}
                </Badge>
              </TableCell>
              {canManage && (
                <TableCell>
                  {a.status === "BOOKED" && (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleCancel(a.id)}>
                      Bekor qilish
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
