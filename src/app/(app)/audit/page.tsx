import { redirect } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AuditPage() {
  const session = await auth();
  if (session?.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit jurnali</h1>
        <p className="text-muted-foreground">Tizimdagi so&apos;nggi 100 ta harakat</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Harakatlar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sana</TableHead>
                <TableHead>Foydalanuvchi</TableHead>
                <TableHead>Amal</TableHead>
                <TableHead>Obyekt</TableHead>
                <TableHead>O&apos;zgarishlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    Yozuvlar mavjud emas
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{format(log.createdAt, "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell>{log.user?.name ?? "—"}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      {log.entityType} #{log.entityId.slice(-8)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-mono text-xs text-muted-foreground">
                      {log.changes ? JSON.stringify(log.changes) : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
