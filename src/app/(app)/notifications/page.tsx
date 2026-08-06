import type { Metadata } from "next";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Bildirishnomalar" };

export default async function NotificationsPage() {
  const session = await auth();
  const notifications = await prisma.staffNotification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bildirishnomalar</h1>
        <p className="text-muted-foreground">Barcha bildirishnomalar tarixi</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tarix</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Bildirishnomalar yo&apos;q</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{format(n.createdAt, "dd.MM.yyyy HH:mm")}</p>
                </div>
                {!n.isRead && <Badge variant="secondary">Yangi</Badge>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
