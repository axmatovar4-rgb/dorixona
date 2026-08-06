import { NextRequest, NextResponse } from "next/server";
import { Prisma, OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.type !== "STAFF" || !can(session.user.role, "sales", "view")) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const search = params.get("search")?.trim();
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(params.get("pageSize") ?? 15)));

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status: status as OrderStatus } : {}),
    ...(search
      ? {
          customer: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          },
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    data: orders.map((o) => ({
      id: o.id,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      total: o.total,
      itemCount: o.items.length,
      requiresPrescription: o.requiresPrescription,
      createdAt: o.createdAt,
      customerName: `${o.customer.firstName} ${o.customer.lastName}`,
      customerPhone: o.customer.phone,
    })),
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  });
}
