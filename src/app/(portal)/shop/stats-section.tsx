import { prisma } from "@/lib/prisma";

export async function StatsSection() {
  const [customerCount, deliveredOrderCount, productCount] = await Promise.all([
    prisma.customer.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  const stats = [
    { label: "Ro'yxatdan o'tgan mijozlar", value: customerCount },
    { label: "Yetkazib berilgan buyurtmalar", value: deliveredOrderCount },
    { label: "Katalogdagi dorilar", value: productCount },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border bg-card p-6 text-center portal-shadow-sm">
          <p className="text-sm text-muted-foreground">{s.label}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-primary">
            +{s.value.toLocaleString("uz-UZ")}
          </p>
        </div>
      ))}
    </div>
  );
}
