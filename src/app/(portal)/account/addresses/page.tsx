import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/modules/customer/components/section";
import { AddressManager } from "@/modules/customer/components/address-manager";

export const metadata: Metadata = { title: "Manzillarim" };

export default async function AddressesPage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({
    where: { customerId: session!.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <PageContainer className="flex flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manzillarim</h1>
        <p className="mt-1 text-muted-foreground">Yetkazib berish manzillarini boshqarish</p>
      </div>
      <AddressManager
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
