"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createTransaction, deleteTransaction } from "@/modules/finance/actions";

type Tx = {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: unknown;
  description: string | null;
  occurredAt: Date;
};

export function TransactionManager({ transactions, canManage }: { transactions: Tx[]; canManage: boolean }) {
  const router = useRouter();
  const [type, setType] = React.useState<"INCOME" | "EXPENSE">("INCOME");
  const [category, setCategory] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [occurredAt, setOccurredAt] = React.useState(new Date().toISOString().slice(0, 10));
  const [pending, setPending] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createTransaction({
      type,
      category,
      amount: Number(amount),
      description,
      occurredAt,
    });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setCategory("");
    setAmount("");
    setDescription("");
    toast.success("Tranzaksiya qo'shildi");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Turi</label>
            <Select
              items={[
                { value: "INCOME", label: "Kirim" },
                { value: "EXPENSE", label: "Chiqim" },
              ]}
              value={type}
              onValueChange={(v) => setType(v as "INCOME" | "EXPENSE")}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Kirim</SelectItem>
                <SelectItem value="EXPENSE">Chiqim</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Kategoriya</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} required className="w-40" placeholder="Ijara, savdo..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Summa</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-32" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Sana</label>
            <Input type="date" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} className="w-40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Izoh</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} className="w-48" />
          </div>
          <Button type="submit" disabled={pending} className="gap-1.5">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Qo&apos;shish
          </Button>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sana</TableHead>
            <TableHead>Turi</TableHead>
            <TableHead>Kategoriya</TableHead>
            <TableHead>Izoh</TableHead>
            <TableHead className="text-right">Summa</TableHead>
            {canManage && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                Tranzaksiyalar mavjud emas
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{format(t.occurredAt, "dd.MM.yyyy")}</TableCell>
                <TableCell>
                  <Badge variant={t.type === "INCOME" ? "secondary" : "outline"}>
                    {t.type === "INCOME" ? "Kirim" : "Chiqim"}
                  </Badge>
                </TableCell>
                <TableCell>{t.category}</TableCell>
                <TableCell>{t.description || "—"}</TableCell>
                <TableCell className={`text-right font-medium ${t.type === "INCOME" ? "text-emerald-600" : "text-destructive"}`}>
                  {t.type === "INCOME" ? "+" : "-"}
                  {Number(t.amount).toLocaleString("uz-UZ")}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <Button variant="ghost" size="icon-sm" onClick={() => deleteTransaction(t.id).then(() => router.refresh())}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
