"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Loader2 } from "lucide-react";
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
import { createInvoice, markInvoicePaid } from "@/modules/accounting/actions";

type Invoice = {
  id: string;
  type: "SALES" | "PURCHASE";
  partyName: string;
  amount: unknown;
  status: "UNPAID" | "PAID" | "OVERDUE";
  dueDate: Date | null;
  issuedAt: Date;
};

function resolveStatus(inv: Invoice): "UNPAID" | "PAID" | "OVERDUE" {
  if (inv.status === "PAID") return "PAID";
  if (inv.dueDate && inv.dueDate.getTime() < Date.now()) return "OVERDUE";
  return "UNPAID";
}

const STATUS_LABELS = { UNPAID: "To'lanmagan", PAID: "To'langan", OVERDUE: "Muddati o'tgan" };
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  UNPAID: "outline",
  PAID: "secondary",
  OVERDUE: "destructive",
};

export function InvoiceManager({ invoices, canManage }: { invoices: Invoice[]; canManage: boolean }) {
  const router = useRouter();
  const [type, setType] = React.useState<"SALES" | "PURCHASE">("SALES");
  const [partyName, setPartyName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createInvoice({ type, partyName, amount: Number(amount), dueDate });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setPartyName("");
    setAmount("");
    setDueDate("");
    toast.success("Hisob-faktura qo'shildi");
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
                { value: "SALES", label: "Sotuv" },
                { value: "PURCHASE", label: "Xarid" },
              ]}
              value={type}
              onValueChange={(v) => setType(v as "SALES" | "PURCHASE")}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SALES">Sotuv</SelectItem>
                <SelectItem value="PURCHASE">Xarid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Kontragent</label>
            <Input value={partyName} onChange={(e) => setPartyName(e.target.value)} required className="w-48" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Summa</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-32" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Muddati</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-40" />
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
            <TableHead>Kontragent</TableHead>
            <TableHead>Muddati</TableHead>
            <TableHead>Holat</TableHead>
            <TableHead className="text-right">Summa</TableHead>
            {canManage && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-20 text-center text-muted-foreground">
                Hisob-fakturalar mavjud emas
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((inv) => {
              const status = resolveStatus(inv);
              return (
                <TableRow key={inv.id}>
                  <TableCell>{format(inv.issuedAt, "dd.MM.yyyy")}</TableCell>
                  <TableCell>{inv.type === "SALES" ? "Sotuv" : "Xarid"}</TableCell>
                  <TableCell>{inv.partyName}</TableCell>
                  <TableCell>{inv.dueDate ? format(inv.dueDate, "dd.MM.yyyy") : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{Number(inv.amount).toLocaleString("uz-UZ")}</TableCell>
                  {canManage && (
                    <TableCell>
                      {status !== "PAID" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markInvoicePaid(inv.id).then(() => router.refresh())}
                        >
                          To&apos;langan
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
