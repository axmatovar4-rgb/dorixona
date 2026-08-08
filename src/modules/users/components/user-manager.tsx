"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2, KeyRound, Copy, Check } from "lucide-react";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ROLE_LABELS } from "@/lib/role-labels";
import { createStaffUser, resetStaffUserPassword, toggleStaffUserActive } from "@/modules/users/actions";

type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  branch: { name: string } | null;
};

type Branch = { id: string; name: string };

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as Role[]).map((r) => ({ value: r, label: ROLE_LABELS[r] }));

export function UserManager({ users, branches }: { users: StaffUser[]; branches: Branch[] }) {
  const router = useRouter();
  const [form, setForm] = React.useState({ name: "", email: "", role: "CASHIER" as Role, branchId: "" });
  const [pending, setPending] = React.useState(false);
  const [tempPassword, setTempPassword] = React.useState<{ label: string; password: string } | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createStaffUser(form);
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setForm({ name: "", email: "", role: "CASHIER", branchId: "" });
    setTempPassword({ label: form.email, password: result.tempPassword });
    router.refresh();
  }

  async function handleReset(user: StaffUser) {
    const result = await resetStaffUserPassword(user.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setTempPassword({ label: user.email, password: result.tempPassword });
  }

  function copyPassword() {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">F.I.Sh</label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className="w-44" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Email</label>
          <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required className="w-56" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Rol</label>
          <Select items={ROLE_OPTIONS} value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as Role }))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {branches.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Filial (ixtiyoriy)</label>
            <Select
              items={[{ value: "", label: "—" }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
              value={form.branchId}
              onValueChange={(v) => setForm((f) => ({ ...f, branchId: v as string }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">—</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button type="submit" disabled={pending} className="gap-1.5">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Qo&apos;shish
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>F.I.Sh</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Filial</TableHead>
            <TableHead>Holat</TableHead>
            <TableHead className="w-40" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                Foydalanuvchilar mavjud emas
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{ROLE_LABELS[u.role]}</TableCell>
                <TableCell>{u.branch?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={u.isActive ? "secondary" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStaffUserActive(u.id, !u.isActive).then(() => router.refresh())}
                  >
                    {u.isActive ? "Faol" : "Nofaol"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => handleReset(u)}>
                    <KeyRound className="h-3.5 w-3.5" />
                    Parolni tiklash
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!tempPassword} onOpenChange={(open) => !open && setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi vaqtinchalik parol</DialogTitle>
            <DialogDescription>
              {tempPassword?.label} uchun parol yaratildi. Buni xodimga xabar bering — bu oyna yopilgach qayta ko&apos;rsatilmaydi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-xl border bg-muted/50 px-3.5 py-3">
            <span className="flex-1 font-mono text-lg tracking-wider">{tempPassword?.password}</span>
            <Button type="button" variant="outline" size="icon-sm" onClick={copyPassword}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
