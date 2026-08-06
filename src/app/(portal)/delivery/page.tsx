import { Truck, Clock, MapPin, Wallet } from "lucide-react";
import { PageContainer } from "@/modules/customer/components/section";
import { DELIVERY_FEE } from "@/modules/customer/constants";

const STEPS = [
  {
    icon: MapPin,
    title: "Xizmat hududi",
    body: "Hozircha Toshkent shahri va yaqin atrofdagi tumanlarga yetkazib beramiz. Manzilni checkout jarayonida xaritadan aniqlashingiz yoki qo'lda kiritishingiz mumkin.",
  },
  {
    icon: Clock,
    title: "Yetkazib berish muddati",
    body: "Buyurtma tasdiqlangandan so'ng odatda 1-3 soat ichida, filialga yaqin manzillarga esa tezroq yetkazamiz.",
  },
  {
    icon: Wallet,
    title: "Yetkazib berish narxi",
    body: `Har bir buyurtma uchun ${DELIVERY_FEE.toLocaleString("uz-UZ")} so'm belgilangan yetkazib berish to'lovi qo'llaniladi.`,
  },
  {
    icon: Truck,
    title: "Kuryer orqali yetkazish",
    body: "Buyurtmangiz filialdan kuryerimiz orqali yuboriladi, holatini \"Buyurtmalarim\" bo'limidan kuzatib borishingiz mumkin.",
  },
];

export default function DeliveryPage() {
  return (
    <PageContainer className="flex flex-col gap-8 py-8 sm:py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Yetkazib berish</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Buyurtmangizni tez va ishonchli tarzda eshigingizgacha yetkazib beramiz.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <div key={s.title} className="flex gap-4 rounded-2xl border bg-card p-6 portal-shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
