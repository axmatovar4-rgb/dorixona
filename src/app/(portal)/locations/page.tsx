import type { Metadata } from "next";
import { MapPin, Phone, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/modules/customer/components/section";

export const metadata: Metadata = { title: "Filiallar" };

export default async function LocationsPage() {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <PageContainer className="flex flex-col gap-8 py-8 sm:py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Filiallar</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Shahar bo&apos;ylab joylashgan filiallarimiz manzillari va aloqa raqamlari.
        </p>
      </div>

      {branches.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground portal-shadow-sm">
          Hozircha filiallar ma&apos;lumoti kiritilmagan
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <div key={b.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-6 portal-shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <p className="font-semibold">{b.name}</p>
              </div>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                  <span>{b.address || "Manzil kiritilmagan"}</span>
                </div>
                {b.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-primary/60" />
                    <span>{b.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
