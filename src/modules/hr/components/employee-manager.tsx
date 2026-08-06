"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createEmployee, updateEmployee, toggleEmployeeActive } from "@/modules/hr/actions";

type Employee = {
  id: string;
  fullName: string;
  position: string;
  department: string | null;
  phone: string | null;
  email: string | null;
  hireDate: Date;
  salary: unknown;
  isActive: boolean;
};

const emptyForm = { fullName: "", position: "", department: "", phone: "", email: "", hireDate: "", salary: "" };

export function EmployeeManager({ employees, canManage }: { employees: Employee[]; canManage: boolean }) {
  const router = useRouter();
  const [form, setForm] = React.useState(emptyForm);
  const [pending, setPending] = React.useState(false);
  const [editing, setEditing] = React.useState<Employee | null>(null);
  const [editForm, setEditForm] = React.useState(emptyForm);
  const [editPending, setEditPending] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createEmployee({
      fullName: form.fullName,
      position: form.position,
      department: form.department,
      phone: form.phone,
      email: form.email,
      hireDate: form.hireDate,
      salary: Number(form.salary),
    });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setForm(emptyForm);
    toast.success("Xodim qo'shildi");
    router.refresh();
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setEditForm({
      fullName: emp.fullName,
      position: emp.position,
      department: emp.department ?? "",
      phone: emp.phone ?? "",
      email: emp.email ?? "",
      hireDate: emp.hireDate.toISOString().slice(0, 10),
      salary: String(Number(emp.salary)),
    });
  }

  async function handleEditSave() {
    if (!editing) return;
    setEditPending(true);
    const result = await updateEmployee(editing.id, {
      fullName: editForm.fullName,
      position: editForm.position,
      department: editForm.department,
      phone: editForm.phone,
      email: editForm.email,
      hireDate: editForm.hireDate,
      salary: Number(editForm.salary),
    });
    setEditPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Yangilandi");
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">F.I.Sh</label>
            <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required className="w-44" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Lavozim</label>
            <Input value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))} required className="w-36" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Bo&apos;lim</label>
            <Input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} className="w-32" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Telefon</label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-36" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Ishga kirgan sana</label>
            <Input type="date" value={form.hireDate} onChange={(e) => setForm((f) => ({ ...f, hireDate: e.target.value }))} required className="w-40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Oylik</label>
            <Input type="number" value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} required className="w-32" />
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
            <TableHead>F.I.Sh</TableHead>
            <TableHead>Lavozim</TableHead>
            <TableHead>Bo&apos;lim</TableHead>
            <TableHead>Ishga kirgan</TableHead>
            <TableHead>Oylik</TableHead>
            <TableHead>Holat</TableHead>
            {canManage && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-20 text-center text-muted-foreground">
                Xodimlar mavjud emas
              </TableCell>
            </TableRow>
          ) : (
            employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium">{emp.fullName}</TableCell>
                <TableCell>{emp.position}</TableCell>
                <TableCell>{emp.department || "—"}</TableCell>
                <TableCell>{format(emp.hireDate, "dd.MM.yyyy")}</TableCell>
                <TableCell>{Number(emp.salary).toLocaleString("uz-UZ")}</TableCell>
                <TableCell>
                  {canManage ? (
                    <Badge
                      variant={emp.isActive ? "secondary" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleEmployeeActive(emp.id, !emp.isActive).then(() => router.refresh())}
                    >
                      {emp.isActive ? "Faol" : "Nofaol"}
                    </Badge>
                  ) : (
                    <Badge variant={emp.isActive ? "secondary" : "outline"}>{emp.isActive ? "Faol" : "Nofaol"}</Badge>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(emp)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xodimni tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>F.I.Sh</Label>
              <Input value={editForm.fullName} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Lavozim</Label>
              <Input value={editForm.position} onChange={(e) => setEditForm((f) => ({ ...f, position: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Bo&apos;lim</Label>
              <Input value={editForm.department} onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Telefon</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Ishga kirgan sana</Label>
              <Input type="date" value={editForm.hireDate} onChange={(e) => setEditForm((f) => ({ ...f, hireDate: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Oylik</Label>
              <Input type="number" value={editForm.salary} onChange={(e) => setEditForm((f) => ({ ...f, salary: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditSave} disabled={editPending} className="gap-1.5">
              {editPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
