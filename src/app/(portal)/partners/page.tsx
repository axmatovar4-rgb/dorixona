import type { Metadata } from "next";
import { Building2, Handshake, Phone, Mail } from "lucide-react";
import { PageContainer } from "@/modules/customer/components/section";

const OPTIONS = [
  {
    icon: Building2,
    title: "Yetkazib beruvchilar uchun",
    body: "Dori-darmon va tibbiyot buyumlari ishlab chiqaruvchi yoki distribyutor bo'lsangiz, hamkorlik shartlarini muhokama qilish uchun biz bilan bog'laning.",
  },
  {
    icon: Handshake,
    title: "Filial ochish",
    body: "Hududingizda PharmCare filialini ochish yoki franshiza bo'yicha hamkorlik qilish istagida bo'lsangiz, ariza yuboring.",
  },
];

export const metadata: Metadata = { title: "Hamkorlik" };

export default function PartnersPage() {
  return (
    <PageContainer className="flex flex-col gap-8 py-8 sm:py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Hamkorlik</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          PharmCare bilan hamkorlik qilishni istaysizmi? Quyidagi yo&apos;nalishlar bo&apos;yicha
          biz bilan bog&apos;lanishingiz mumkin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {OPTIONS.map((o) => (
          <div key={o.title} className="flex gap-4 rounded-2xl border bg-card p-6 portal-shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <o.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{o.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{o.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-6 portal-shadow-sm">
        <h2 className="mb-4 font-semibold">Biz bilan bog&apos;laning</h2>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 text-primary/60" />
            <span>+998 71 200 20 20</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4 text-primary/60" />
            <span>hamkorlik@pharmcare.uz</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
