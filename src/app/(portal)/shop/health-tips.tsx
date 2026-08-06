import { Droplets, Moon, Salad, Dumbbell } from "lucide-react";
import { SectionHeader } from "@/modules/customer/components/section";

const TIPS = [
  {
    icon: Droplets,
    title: "Ko'p suv iching",
    text: "Kuniga kamida 6-8 stakan suv ichish tanangizning normal ishlashi uchun muhim.",
  },
  {
    icon: Moon,
    title: "Sifatli uyqu",
    text: "Kuniga 7-8 soat uyqu immunitetni mustahkamlaydi va sog'lig'ingizni yaxshilaydi.",
  },
  {
    icon: Salad,
    title: "To'g'ri ovqatlanish",
    text: "Ko'proq sabzavot va mevalar iste'mol qiling, yog'li ovqatlarni cheklang.",
  },
  {
    icon: Dumbbell,
    title: "Muntazam harakat",
    text: "Kuniga 30 daqiqa yurish yoki mashq qilish yurak-qon tomir sog'ligini qo'llab-quvvatlaydi.",
  },
];

export function HealthTips() {
  return (
    <div>
      <SectionHeader title="Sog'liq bo'yicha maslahatlar" subtitle="Kundalik hayotingiz uchun foydali tavsiyalar" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TIPS.map((tip) => (
          <div
            key={tip.title}
            className="rounded-2xl border bg-card p-6 portal-shadow-sm transition-shadow hover:portal-shadow"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <tip.icon className="h-5 w-5" />
            </div>
            <p className="font-semibold">{tip.title}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
