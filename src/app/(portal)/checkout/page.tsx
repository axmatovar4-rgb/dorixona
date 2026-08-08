import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/modules/customer/components/section";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Buyurtmani rasmiylashtirish" };

export default async function CheckoutPage() {
  const session = await auth();
  const [addresses, zonesRaw] = await Promise.all([
    prisma.address.findMany({
      where: { customerId: session!.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    prisma.deliveryZone.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <PageContainer className="flex flex-col gap-6 py-8 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight">Buyurtmani rasmiylashtirish</h1>
      <CheckoutForm
        addresses={addresses.map((a) => ({
          id: a.id,
          label: a.label,
          fullAddress: a.fullAddress,
          isDefault: a.isDefault,
        }))}
        zones={zonesRaw.map((z) => ({ id: z.id, name: z.name, fee: Number(z.fee), isDefault: z.isDefault }))}
      />
    </PageContainer>
  );
}
