import type { Metadata } from "next";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Fikrlar" };

export default async function FeedbackPage() {
  const session = await auth();
  const canView = await canAsync(session?.user.role, "feedback", "view");
  if (!canView) redirect("/dashboard");

  const feedback = await prisma.appFeedback.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { firstName: true, lastName: true, phone: true } } },
    take: 200,
  });

  const withRating = feedback.filter((f) => f.rating != null);
  const avgRating =
    withRating.length > 0 ? withRating.reduce((sum, f) => sum + (f.rating ?? 0), 0) / withRating.length : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fikrlar</h1>
        <p className="text-muted-foreground">
          Mijozlar ilova haqida qoldirgan fikrlari
          {avgRating != null && ` — o'rtacha baho: ${avgRating.toFixed(1)} (${withRating.length} ta baho)`}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>So&apos;nggi fikrlar</CardTitle>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Hozircha fikrlar yo&apos;q</p>
          ) : (
            <div className="flex flex-col gap-3">
              {feedback.map((f) => (
                <div key={f.id} className="rounded-xl border p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {f.customer.firstName} {f.customer.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">{format(f.createdAt, "dd.MM.yyyy HH:mm")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{f.customer.phone}</p>
                  {f.rating != null && (
                    <div className="mt-1.5 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn("h-3.5 w-3.5", i < f.rating! ? "fill-primary text-primary" : "fill-muted text-muted")}
                        />
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-foreground">{f.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
