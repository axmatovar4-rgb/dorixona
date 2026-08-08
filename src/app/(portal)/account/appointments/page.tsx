import type { Metadata } from "next";
import { PageContainer } from "@/modules/customer/components/section";
import { MyAppointments } from "@/modules/customer/components/my-appointments";
import { getMyAppointments } from "@/modules/doctors/actions";

export const metadata: Metadata = { title: "Qabullarim" };

export default async function MyAppointmentsPage() {
  const appointments = await getMyAppointments();

  return (
    <PageContainer className="flex flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Qabullarim</h1>
        <p className="mt-1 text-muted-foreground">PharmaMed shifokorlariga yozilgan qabullaringiz</p>
      </div>
      <MyAppointments appointments={appointments} />
    </PageContainer>
  );
}
