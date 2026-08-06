import type { Metadata } from "next";
import { PageContainer } from "@/modules/customer/components/section";

const SECTIONS = [
  {
    title: "Qaytarish shartlari",
    body: "Dori-darmon sog'liq uchun maxsus mahsulot bo'lgani sababli, qadog'i ochilmagan va yaroqlilik muddati o'tmagan mahsulotlarni yetkazib berilgan kundan 3 kun ichida qaytarish mumkin.",
  },
  {
    title: "Qaytarib bo'lmaydigan holatlar",
    body: "Qadog'i ochilgan, saqlash sharti buzilgan yoki retsept asosida individual tayyorlangan dorilar qaytarilmaydi — bu farmatsevtika xavfsizligi qoidalariga asoslanadi.",
  },
  {
    title: "Noto'g'ri yoki nosoz mahsulot",
    body: "Agar sizga noto'g'ri mahsulot yetkazilgan yoki mahsulot nosoz bo'lsa, buyurtma raqamingiz bilan qo'llab-quvvatlash xizmatiga murojaat qiling — mahsulot bepul almashtiriladi yoki puli qaytariladi.",
  },
  {
    title: "Pulni qaytarish muddati",
    body: "Qaytarish tasdiqlangandan so'ng, to'lov summasi 3-5 ish kuni ichida to'lov usulingizga qaytariladi.",
  },
];

export const metadata: Metadata = { title: "Qaytarish siyosati" };

export default function ReturnsPage() {
  return (
    <PageContainer className="flex flex-col gap-8 py-8 sm:py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Qaytarish siyosati</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Mijozlarimizning xavfsizligi va qulayligi biz uchun muhim — quyida qaytarish shartlari
          bilan tanishing.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-2xl border bg-card p-5 portal-shadow-sm">
            <p className="font-semibold">{s.title}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
