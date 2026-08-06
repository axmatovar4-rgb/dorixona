import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function notifyRoles(
  roles: Role[],
  input: { type: "NEW_ORDER"; title: string; body: string }
) {
  const users = await prisma.user.findMany({
    where: { role: { in: roles }, isActive: true },
    select: { id: true },
  });
  if (users.length === 0) return;

  await prisma.staffNotification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: input.type,
      title: input.title,
      body: input.body,
    })),
  });
}
