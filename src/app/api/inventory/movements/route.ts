import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "inventory", "view")) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const warehouseId = params.get("warehouseId");
  const type = params.get("type");
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize") ?? 15)));

  const where: Prisma.StockMovementWhereInput = {
    ...(warehouseId ? { warehouseId } : {}),
    ...(type ? { type: type as Prisma.EnumMovementTypeFilter["equals"] } : {}),
  };

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: { product: true, warehouse: true, performedBy: true, batch: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return NextResponse.json({
    data: movements,
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  });
}
