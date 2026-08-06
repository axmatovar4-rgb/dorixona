import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/modules/customer/components/section";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({
    where: { customerId: session!.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

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
      />
    </PageContainer>
  );
}
