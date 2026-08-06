import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "view")) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const productId = params.get("productId");
  const warehouseId = params.get("warehouseId");

  if (!productId || !warehouseId) {
    return NextResponse.json({ data: [] });
  }

  const batches = await prisma.batch.findMany({
    where: { productId, warehouseId, quantity: { gt: 0 } },
    orderBy: { expiryDate: "asc" },
  });

  return NextResponse.json({ data: batches });
}
