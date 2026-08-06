import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

export const searchMedicinesTool: Anthropic.Tool = {
  name: "search_medicines",
  description:
    "PharmCare dorixonasi katalogidan dori nomi bo'yicha qidiradi. Foydalanuvchi biror dori haqida (mavjudligi, narxi, qadoqlanishi) so'raganda ishlating. Har bir natija uchun nomi, dozasi, birligi, narxi, retsept talab qilinishi va omborda mavjudligini qaytaradi.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Dori nomi yoki uning bir qismi (masalan, 'Paracetamol')",
      },
    },
    required: ["query"],
  },
};

export async function runSearchMedicines(query: string): Promise<string> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      name: { contains: query, mode: "insensitive" },
    },
    select: {
      name: true,
      dosage: true,
      unit: true,
      sellPrice: true,
      prescriptionRequired: true,
      batches: { select: { quantity: true } },
    },
    take: 8,
  });

  if (products.length === 0) {
    return JSON.stringify({ found: false, message: "Bu nomga mos dori dorixona katalogida topilmadi." });
  }

  const results = products.map((p) => ({
    name: p.name,
    dosage: p.dosage ?? null,
    unit: p.unit,
    price: Number(p.sellPrice),
    prescriptionRequired: p.prescriptionRequired,
    inStock: p.batches.reduce((sum, b) => sum + b.quantity, 0) > 0,
  }));

  return JSON.stringify({ found: true, results });
}
