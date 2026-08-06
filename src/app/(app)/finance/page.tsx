import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAsync } from "@/lib/rbac-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionManager } from "@/modules/finance/components/transaction-manager";

export const metadata: Metadata = { title: "Finance" };

export default async function FinancePage() {
  const session = await auth();
  const canManage = await canAsync(session?.user.role, "finance", "create");

  const [transactions, incomeSum, expenseSum] = await Promise.all([
    prisma.transaction.findMany({ orderBy: { occurredAt: "desc" }, take: 100 }),
    prisma.transaction.aggregate({ where: { type: "INCOME" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "EXPENSE" }, _sum: { amount: true } }),
  ]);

  const income = Number(incomeSum._sum.amount ?? 0);
  const expense = Number(expenseSum._sum.amount ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Moliya</h1>
        <p className="text-muted-foreground">Kirim-chiqim tranzaksiyalari</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jami kirim</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">
            {income.toLocaleString("uz-UZ")} so&apos;m
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jami chiqim</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-destructive">
            {expense.toLocaleString("uz-UZ")} so&apos;m
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sof balans</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {(income - expense).toLocaleString("uz-UZ")} so&apos;m
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tranzaksiyalar</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionManager transactions={transactions} canManage={canManage} />
        </CardContent>
      </Card>
    </div>
  );
}
