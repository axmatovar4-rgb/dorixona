export const SPECIALTIES = [
  { label: "Terapevt", emoji: "🩺", description: "Umumiy kasalliklarni tekshiradi va davolaydi." },
  { label: "Kardiolog", emoji: "❤️", description: "Yurak va qon tomir kasalliklari bilan shug'ullanadi." },
  { label: "Nevrolog", emoji: "🧠", description: "Miya va asab tizimini davolaydi." },
  { label: "Pediatr", emoji: "👶", description: "Bolalar salomatligi bilan shug'ullanadi." },
  { label: "Oftalmolog", emoji: "👁️", description: "Ko'z va ko'rish bilan bog'liq muammolarni davolaydi." },
  { label: "LOR", emoji: "👂", description: "Quloq, burun va tomoq kasalliklarini davolaydi." },
  { label: "Stomatolog", emoji: "🦷", description: "Tish va og'iz bo'shlig'ini davolaydi." },
  { label: "Ortoped", emoji: "🦴", description: "Suyak, bo'g'im va mushaklar bilan shug'ullanadi." },
  { label: "Jarroh", emoji: "🩹", description: "Operatsiya talab qiladigan kasalliklarni davolaydi." },
  { label: "Dermatolog", emoji: "🧴", description: "Teri, soch va tirnoq kasalliklarini davolaydi." },
  { label: "Pulmonolog", emoji: "🫁", description: "O'pka va nafas olish tizimini davolaydi." },
  { label: "Gematolog", emoji: "🩸", description: "Qon kasalliklarini davolaydi." },
  { label: "Endokrinolog", emoji: "🧪", description: "Gormonlar va qalqonsimon bez kabi endokrin tizim bilan shug'ullanadi." },
  { label: "Nefrolog", emoji: "🫘", description: "Buyrak kasalliklarini davolaydi." },
  { label: "Urolog", emoji: "🚻", description: "Siydik chiqarish tizimi va erkaklar reproduktiv tizimi bilan shug'ullanadi." },
  { label: "Onkolog", emoji: "🎗️", description: "O'sma va saraton kasalliklarini davolash bilan shug'ullanadi." },
  { label: "Ginekolog", emoji: "🤰", description: "Ayollar reproduktiv salomatligi bilan shug'ullanadi." },
  { label: "Psixiatr", emoji: "🧠", description: "Ruhiy salomatlik bilan bog'liq kasalliklarni davolaydi." },
  { label: "Travmatolog", emoji: "🦵", description: "Jarohatlar va shikastlanishlarni davolaydi." },
  { label: "Ortodont", emoji: "🦷", description: "Tishlarning joylashuvi va tishlash muammolarini tuzatadi." },
  { label: "Radiolog", emoji: "🔬", description: "Rentgen, KT, MRT kabi tasviriy tekshiruvlarni tahlil qiladi." },
] as const;

export type SpecialtyLabel = (typeof SPECIALTIES)[number]["label"];

const SPECIALTY_MAP: Map<string, (typeof SPECIALTIES)[number]> = new Map(SPECIALTIES.map((s) => [s.label, s]));

export function getSpecialtyInfo(label: string) {
  return SPECIALTY_MAP.get(label);
}
