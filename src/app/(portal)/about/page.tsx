import type { Metadata } from "next";
import { ShieldCheck, Truck, Clock, HeartHandshake } from "lucide-react";
import { PageContainer } from "@/modules/customer/components/section";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Original dorilar",
    body: "Barcha mahsulotlar rasmiy yetkazib beruvchilardan, sertifikatlangan va nazoratdan o'tgan.",
  },
  {
    icon: Truck,
    title: "Tezkor yetkazib berish",
    body: "Toshkent bo'ylab bir necha soat ichida, filiallarimiz orqali qisqa muddatda yetkazamiz.",
  },
  {
    icon: Clock,
    title: "24/7 buyurtma qabul",
    body: "Saytimiz orqali istalgan vaqtda buyurtma bering — operatorlarimiz tez orada bog'lanadi.",
  },
  {
    icon: HeartHandshake,
    title: "Mijozga g'amxo'rlik",
    body: "Farmatsevtlarimiz har bir mijozga individual yondashadi, dori haqida to'liq maslahat beradi.",
  },
];

export const metadata: Metadata = { title: "Biz haqimizda" };

export default function AboutPage() {
  return (
    <PageContainer className="flex flex-col gap-10 py-8 sm:py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Biz haqimizda</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          PharmCare — O&apos;zbekistondagi ishonchli onlayn dorixonalar zanjiri. Maqsadimiz har bir
          mijozga sifatli dori-darmonni qulay, tez va ishonchli tarzda yetkazib berish. Bir necha
          filialimiz orqali shahar bo&apos;ylab xizmat ko&apos;rsatamiz.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {VALUES.map((v) => (
          <div key={v.title} className="flex gap-4 rounded-2xl border bg-card p-6 portal-shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <v.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{v.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{v.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-6 portal-shadow-sm">
        <h2 className="mb-2 font-semibold">Missiyamiz</h2>
        <p className="text-sm text-muted-foreground">
          Har bir oilaning sog&apos;ligini qo&apos;llab-quvvatlash uchun dori-darmonni hamma uchun
          qulay va ishonchli qilish. Zamonaviy texnologiyalar yordamida buyurtma berish jarayonini
          soddalashtiramiz va farmatsevtik xizmat sifatini oshirib boramiz.
        </p>
      </div>
    </PageContainer>
  );
}
