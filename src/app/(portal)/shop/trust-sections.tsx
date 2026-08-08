import Link from "next/link";
import { Factory, ShieldCheck, Award, BadgeCheck, FileCheck, MapPin, Phone, Mail, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/modules/customer/components/section";
import { Marquee } from "@/components/marquee";

const CERTIFICATES = [
  {
    icon: ShieldCheck,
    title: "Sog'liqni saqlash vazirligi litsenziyasi",
    body: "Farmatsevtika faoliyatini yuritish uchun rasmiy davlat litsenziyasiga egamiz.",
  },
  {
    icon: FileCheck,
    title: "GDP standarti",
    body: "Dori-darmonlarni saqlash va tashishda xalqaro yaxshi taqsimot amaliyoti talablariga rioya qilamiz.",
  },
  {
    icon: Award,
    title: "ISO 9001:2015",
    body: "Sifat menejmenti tizimi bo'yicha xalqaro sertifikatga muvofiq ishlaymiz.",
  },
  {
    icon: BadgeCheck,
    title: "Xavfsiz to'lov",
    body: "Onlayn to'lovlar zamonaviy xavfsizlik standartlariga mos himoyalangan.",
  },
];

export async function PartnersSection() {
  const manufacturers = await prisma.manufacturer.findMany({
    where: { products: { some: { isActive: true } } },
    orderBy: { name: "asc" },
    take: 12,
  });
  if (manufacturers.length === 0) return null;

  return (
    <div>
      <SectionHeader title="Hamkorlarimiz" subtitle="Ishonchli ishlab chiqaruvchilar bilan hamkorlikdamiz" />
      <Marquee durationSeconds={manufacturers.length * 4} reverse>
        {manufacturers.map((m) => (
          <div
            key={m.id}
            className="flex shrink-0 items-center gap-2 rounded-full border bg-card px-4 py-2.5 text-sm font-medium portal-shadow-sm"
          >
            <Factory className="h-4 w-4 text-primary/60" />
            {m.name}
            {m.country && <span className="text-muted-foreground">· {m.country}</span>}
          </div>
        ))}
      </Marquee>
    </div>
  );
}

export function CertificatesSection() {
  return (
    <div>
      <SectionHeader title="Sertifikatlarimiz" subtitle="Sifat va xavfsizlik bo'yicha kafolatlarimiz" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CERTIFICATES.map((c) => (
          <div key={c.title} className="flex flex-col gap-3 rounded-2xl border bg-card p-5 portal-shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <c.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{c.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function BranchesSection() {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    take: 6,
  });
  if (branches.length === 0) return null;

  return (
    <div>
      <SectionHeader title="Filiallarimiz" subtitle="Shahar bo'ylab joylashgan filiallarimiz" href="/locations" />
      <Marquee durationSeconds={branches.length * 6}>
        {branches.map((b) => (
          <div key={b.id} className="flex w-64 shrink-0 flex-col gap-2 rounded-2xl border bg-card p-5 portal-shadow-sm">
            <p className="font-semibold">{b.name}</p>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
              <span>{b.address || "Manzil kiritilmagan"}</span>
            </div>
            {b.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary/60" />
                <span>{b.phone}</span>
              </div>
            )}
          </div>
        ))}
      </Marquee>
    </div>
  );
}

export function ContactSection() {
  return (
    <div>
      <SectionHeader title="Biz bilan bog'laning" subtitle="Savollaringiz bo'lsa, murojaat qiling" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-5 portal-shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Telefon</p>
            <p className="font-semibold">+998 71 200 20 20</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-5 portal-shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-semibold">info@pharmcare.uz</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-5 portal-shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ish vaqti</p>
            <p className="font-semibold">Har kuni 08:00 – 22:00</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Ko&apos;proq ma&apos;lumot uchun{" "}
        <Link href="/about" className="font-medium text-primary hover:underline">
          biz haqimizda
        </Link>{" "}
        yoki{" "}
        <Link href="/faq" className="font-medium text-primary hover:underline">
          ko&apos;p so&apos;raladigan savollar
        </Link>{" "}
        sahifasiga o&apos;ting.
      </p>
    </div>
  );
}
