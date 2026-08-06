"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { createPayslip, markPayslipPaid } from "@/modules/payroll/actions";

type Employee = { id: string; fullName: string; salary: unknown };
type Payslip = {
  id: string;
  month: string;
  baseSalary: unknown;
  bonuses: unknown;
  deductions: unknown;
  netPay: unknown;
  status: "DRAFT" | "PAID";
  employee: { fullName: string };
};

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function PayslipManager({
  employees,
  payslips,
  canManage,
}: {
  employees: Employee[];
  payslips: Payslip[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = React.useState("");
  const [month, setMonth] = React.useState(currentMonth());
  const [baseSalary, setBaseSalary] = React.useState("");
  const [bonuses, setBonuses] = React.useState("0");
  const [deductions, setDeductions] = React.useState("0");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) setBaseSalary(String(Number(emp.salary)));
  }, [employeeId, employees]);

  const netPay = Number(baseSalary || 0) + Number(bonuses || 0) - Number(deductions || 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createPayslip({
      employeeId,
      month,
      baseSalary: Number(baseSalary),
      bonuses: Number(bonuses),
      deductions: Number(deductions),
    });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setEmployeeId("");
    setBonuses("0");
    setDeductions("0");
    toast.success("Hisoblanma yaratildi");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Xodim</label>
            <Select items={employees.map((e) => ({ value: e.id, label: e.fullName }))} value={employeeId} onValueChange={(v) => setEmployeeId(v ?? "")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tanlang" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Oy</label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-36" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Asosiy oylik</label>
            <Input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} className="w-32" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Bonus</label>
            <Input type="number" value={bonuses} onChange={(e) => setBonuses(e.target.value)} className="w-28" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Ushlanma</label>
            <Input type="number" value={deductions} onChange={(e) => setDeductions(e.target.value)} className="w-28" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Sof to&apos;lov</label>
            <div className="flex h-9 w-32 items-center rounded-md border bg-muted px-3 text-sm font-medium">
              {netPay.toLocaleString("uz-UZ")}
            </div>
          </div>
          <Button type="submit" disabled={pending || !employeeId} className="gap-1.5">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Yaratish
          </Button>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Xodim</TableHead>
            <TableHead>Oy</TableHead>
            <TableHead>Asosiy</TableHead>
            <TableHead>Bonus</TableHead>
            <TableHead>Ushlanma</TableHead>
            <TableHead>Sof to&apos;lov</TableHead>
            <TableHead>Holat</TableHead>
            {canManage && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payslips.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-20 text-center text-muted-foreground">
                Hisoblanmalar mavjud emas
              </TableCell>
            </TableRow>
          ) : (
            payslips.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.employee.fullName}</TableCell>
                <TableCell>{p.month}</TableCell>
                <TableCell>{Number(p.baseSalary).toLocaleString("uz-UZ")}</TableCell>
                <TableCell>{Number(p.bonuses).toLocaleString("uz-UZ")}</TableCell>
                <TableCell>{Number(p.deductions).toLocaleString("uz-UZ")}</TableCell>
                <TableCell className="font-semibold">{Number(p.netPay).toLocaleString("uz-UZ")}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "PAID" ? "secondary" : "outline"}>
                    {p.status === "PAID" ? "To'langan" : "Qoralama"}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell>
                    {p.status !== "PAID" && (
                      <Button size="sm" variant="outline" onClick={() => markPayslipPaid(p.id).then(() => router.refresh())}>
                        To&apos;landi
                      </Button>
                    )}
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
