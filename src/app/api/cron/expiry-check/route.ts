import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkExpiryForCustomer } from "@/lib/expiry-check";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const customerIds = await prisma.customer.findMany({
    where: { orders: { some: {} } },
    select: { id: true },
  });

  for (const { id } of customerIds) {
    await checkExpiryForCustomer(id);
  }

  return Response.json({ checked: customerIds.length });
}
