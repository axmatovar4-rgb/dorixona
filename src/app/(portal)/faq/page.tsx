import { PageContainer } from "@/modules/customer/components/section";

const FAQS = [
  {
    q: "Buyurtmani qanday berish mumkin?",
    a: "Kerakli dorilarni katalogdan tanlab savatga qo'shing, so'ng \"Buyurtma berish\" tugmasini bosib manzil va to'lov usulini tanlang. Buyurtma berish uchun ro'yxatdan o'tган bo'lishingiz kerak.",
  },
  {
    q: "Retseptga muhtoj dorilarni qanday buyurtma qilaman?",
    a: "Retsept talab qilinadigan dorini savatga qo'shsangiz, buyurtma tasdiqlangach farmatsevtimiz siz bilan bog'lanib retseptni tekshiradi.",
  },
  {
    q: "To'lov qanday amalga oshiriladi?",
    a: "Naqd pul (yetkazib berilganda) yoki onlayn karta orqali (Visa/Mastercard/Uzcard) to'lashingiz mumkin.",
  },
  {
    q: "Buyurtmamni qanday kuzataman?",
    a: "\"Buyurtmalarim\" bo'limida buyurtma holatini (qabul qilindi, tayyorlanmoqda, yetkazilmoqda, yetkazildi) real vaqtda ko'rishingiz mumkin.",
  },
  {
    q: "Dori muddati o'tgan yoki mos kelmasa nima qilaman?",
    a: "Bunday holatda buyurtma raqamingiz bilan qo'llab-quvvatlash xizmatimizga murojaat qiling — \"Qaytarish siyosati\" sahifasida batafsil ma'lumot bor.",
  },
];

export default function FaqPage() {
  return (
    <PageContainer className="flex flex-col gap-8 py-8 sm:py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ko&apos;p so&apos;raladigan savollar</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Buyurtma berish, to&apos;lov va yetkazib berish haqida eng ko&apos;p beriladigan savollarga javoblar.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FAQS.map((item) => (
          <div key={item.q} className="rounded-2xl border bg-card p-5 portal-shadow-sm">
            <p className="font-semibold">{item.q}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
