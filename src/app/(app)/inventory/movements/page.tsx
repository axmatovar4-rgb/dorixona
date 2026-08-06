import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MovementsTable } from "./movements-table";

export const metadata: Metadata = { title: "Harakatlar tarixi" };

export default async function MovementsPage() {
  const warehouses = await prisma.warehouse.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ombor harakatlari tarixi</h1>
        <p className="text-sm text-muted-foreground">Barcha kirim, chiqim va transferlar</p>
      </div>
      <MovementsTable warehouses={warehouses} />
    </div>
  );
}
