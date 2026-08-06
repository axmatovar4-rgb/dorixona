"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createSupplier, deleteSupplier, toggleSupplierActive } from "@/modules/suppliers/actions";

type Supplier = {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
};

export function SupplierManager({ suppliers, canManage }: { suppliers: Supplier[]; canManage: boolean }) {
  const router = useRouter();
  const [form, setForm] = React.useState({ name: "", contactPerson: "", phone: "", email: "", address: "" });
  const [pending, setPending] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createSupplier(form);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setForm({ name: "", contactPerson: "", phone: "", email: "", address: "" });
    toast.success("Yetkazib beruvchi qo'shildi");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Nomi</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className="w-48" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Kontakt shaxs</label>
            <Input value={form.contactPerson} onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))} className="w-44" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Telefon</label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Email</label>
            <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-48" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Manzil</label>
            <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="w-56" />
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
            <TableHead>Nomi</TableHead>
            <TableHead>Kontakt</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Holat</TableHead>
            {canManage && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                Yetkazib beruvchilar mavjud emas
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.contactPerson || "—"}</TableCell>
                <TableCell>{s.phone || "—"}</TableCell>
                <TableCell>{s.email || "—"}</TableCell>
                <TableCell>
                  {canManage ? (
                    <Badge
                      variant={s.isActive ? "secondary" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSupplierActive(s.id, !s.isActive).then(() => router.refresh())}
                    >
                      {s.isActive ? "Faol" : "Nofaol"}
                    </Badge>
                  ) : (
                    <Badge variant={s.isActive ? "secondary" : "outline"}>{s.isActive ? "Faol" : "Nofaol"}</Badge>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        }
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>O&apos;chirishni tasdiqlang</AlertDialogTitle>
                          <AlertDialogDescription>
                            &quot;{s.name}&quot;ni o&apos;chirmoqchimisiz?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => deleteSupplier(s.id).then(() => router.refresh())}
                          >
                            O&apos;chirish
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
