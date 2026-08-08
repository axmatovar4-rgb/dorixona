"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  createDeliveryZone,
  updateDeliveryZone,
  toggleDeliveryZoneActive,
  deleteDeliveryZone,
} from "@/modules/delivery/actions";

type Zone = {
  id: string;
  name: string;
  fee: number;
  isDefault: boolean;
  isActive: boolean;
};

export function DeliveryZoneManager({ zones, canManage }: { zones: Zone[]; canManage: boolean }) {
  const router = useRouter();
  const [form, setForm] = React.useState({ name: "", fee: "15000", isDefault: false });
  const [pending, setPending] = React.useState(false);

  const [editing, setEditing] = React.useState<Zone | null>(null);
  const [editForm, setEditForm] = React.useState({ name: "", fee: "15000", isDefault: false });
  const [editPending, setEditPending] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createDeliveryZone({ name: form.name, fee: Number(form.fee), isDefault: form.isDefault });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setForm({ name: "", fee: "15000", isDefault: false });
    toast.success("Hudud qo'shildi");
    router.refresh();
  }

  function openEdit(zone: Zone) {
    setEditing(zone);
    setEditForm({ name: zone.name, fee: String(zone.fee), isDefault: zone.isDefault });
  }

  async function handleEditSave() {
    if (!editing) return;
    setEditPending(true);
    const result = await updateDeliveryZone(editing.id, {
      name: editForm.name,
      fee: Number(editForm.fee),
      isDefault: editForm.isDefault,
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
            <label className="text-sm font-medium">Hudud nomi</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Shahar markazi"
              required
              className="w-48"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Narxi (so&apos;m)</label>
            <Input
              type="number"
              min={0}
              value={form.fee}
              onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))}
              required
              className="w-32"
            />
          </div>
          <label className="mb-2 flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="h-4 w-4 accent-primary"
            />
            Standart
          </label>
          <Button type="submit" disabled={pending} className="gap-1.5">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Qo&apos;shish
          </Button>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hudud</TableHead>
            <TableHead>Narxi</TableHead>
            <TableHead>Standart</TableHead>
            <TableHead>Holat</TableHead>
            {canManage && <TableHead className="w-16" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {zones.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                Hududlar mavjud emas — checkout&apos;da standart {" "}
                <span className="font-mono">15 000</span> so&apos;m ishlatiladi
              </TableCell>
            </TableRow>
          ) : (
            zones.map((z) => (
              <TableRow key={z.id}>
                <TableCell className="font-medium">{z.name}</TableCell>
                <TableCell>{z.fee.toLocaleString("uz-UZ")} so&apos;m</TableCell>
                <TableCell>{z.isDefault && <Badge variant="secondary">Standart</Badge>}</TableCell>
                <TableCell>
                  {canManage ? (
                    <Badge
                      variant={z.isActive ? "secondary" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDeliveryZoneActive(z.id, !z.isActive).then(() => router.refresh())}
                    >
                      {z.isActive ? "Faol" : "Nofaol"}
                    </Badge>
                  ) : (
                    <Badge variant={z.isActive ? "secondary" : "outline"}>{z.isActive ? "Faol" : "Nofaol"}</Badge>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(z)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
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
                            &quot;{z.name}&quot; hududini o&apos;chirmoqchimisiz?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => deleteDeliveryZone(z.id).then(() => router.refresh())}
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

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hududni tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Hudud nomi</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Narxi (so&apos;m)</Label>
              <Input
                type="number"
                min={0}
                value={editForm.fee}
                onChange={(e) => setEditForm((f) => ({ ...f, fee: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={editForm.isDefault}
                onChange={(e) => setEditForm((f) => ({ ...f, isDefault: e.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              Standart hudud
            </label>
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
