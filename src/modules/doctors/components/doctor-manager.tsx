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
import { WEEKDAY_LABELS, WEEKDAY_ORDER } from "@/lib/weekday-labels";
import { WEEKDAYS } from "@/modules/doctors/schemas";
import { createDoctor, updateDoctor, toggleDoctorActive, deleteDoctor } from "@/modules/doctors/actions";

type Weekday = (typeof WEEKDAYS)[number];

type Doctor = {
  id: string;
  fullName: string;
  specialty: string;
  age: number;
  photoUrl: string | null;
  bio: string | null;
  workDays: Weekday[];
  workStartTime: string;
  workEndTime: string;
  isActive: boolean;
};

const emptyForm = {
  fullName: "",
  specialty: "",
  age: "35",
  photoUrl: "",
  bio: "",
  workDays: [] as Weekday[],
  workStartTime: "09:00",
  workEndTime: "18:00",
};

function WeekdayPicker({ value, onChange }: { value: Weekday[]; onChange: (v: Weekday[]) => void }) {
  function toggle(day: Weekday) {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]);
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {WEEKDAY_ORDER.map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => toggle(day)}
          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
            value.includes(day) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
          }`}
        >
          {WEEKDAY_LABELS[day].slice(0, 3)}
        </button>
      ))}
    </div>
  );
}

export function DoctorManager({ doctors, canManage }: { doctors: Doctor[]; canManage: boolean }) {
  const router = useRouter();
  const [form, setForm] = React.useState(emptyForm);
  const [pending, setPending] = React.useState(false);

  const [editing, setEditing] = React.useState<Doctor | null>(null);
  const [editForm, setEditForm] = React.useState(emptyForm);
  const [editPending, setEditPending] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createDoctor({
      fullName: form.fullName,
      specialty: form.specialty,
      age: Number(form.age),
      photoUrl: form.photoUrl,
      bio: form.bio,
      workDays: form.workDays,
      workStartTime: form.workStartTime,
      workEndTime: form.workEndTime,
    });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setForm(emptyForm);
    toast.success("Shifokor qo'shildi");
    router.refresh();
  }

  function openEdit(doc: Doctor) {
    setEditing(doc);
    setEditForm({
      fullName: doc.fullName,
      specialty: doc.specialty,
      age: String(doc.age),
      photoUrl: doc.photoUrl ?? "",
      bio: doc.bio ?? "",
      workDays: doc.workDays,
      workStartTime: doc.workStartTime,
      workEndTime: doc.workEndTime,
    });
  }

  async function handleEditSave() {
    if (!editing) return;
    setEditPending(true);
    const result = await updateDoctor(editing.id, {
      fullName: editForm.fullName,
      specialty: editForm.specialty,
      age: Number(editForm.age),
      photoUrl: editForm.photoUrl,
      bio: editForm.bio,
      workDays: editForm.workDays,
      workStartTime: editForm.workStartTime,
      workEndTime: editForm.workEndTime,
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
        <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-xl border p-3.5">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">F.I.Sh</label>
              <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required className="w-48" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Mutaxassisligi</label>
              <Input value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} placeholder="Terapevt" required className="w-40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Yoshi</label>
              <Input type="number" min={20} max={90} value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} required className="w-24" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Ish boshlanishi</label>
              <Input type="time" value={form.workStartTime} onChange={(e) => setForm((f) => ({ ...f, workStartTime: e.target.value }))} className="w-28" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Ish tugashi</label>
              <Input type="time" value={form.workEndTime} onChange={(e) => setForm((f) => ({ ...f, workEndTime: e.target.value }))} className="w-28" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Rasm havolasi</label>
              <Input value={form.photoUrl} onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))} className="w-48" />
            </div>
            <Button type="submit" disabled={pending} className="gap-1.5">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Qo&apos;shish
            </Button>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Ish kunlari</label>
            <WeekdayPicker value={form.workDays} onChange={(v) => setForm((f) => ({ ...f, workDays: v }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Qisqacha ma&apos;lumot</label>
            <Input value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Tajriba, ma'lumot va h.k." />
          </div>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>F.I.Sh</TableHead>
            <TableHead>Mutaxassislik</TableHead>
            <TableHead>Yoshi</TableHead>
            <TableHead>Ish kunlari</TableHead>
            <TableHead>Ish soati</TableHead>
            <TableHead>Holat</TableHead>
            {canManage && <TableHead className="w-16" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-20 text-center text-muted-foreground">
                Shifokorlar mavjud emas
              </TableCell>
            </TableRow>
          ) : (
            doctors.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.fullName}</TableCell>
                <TableCell>{doc.specialty}</TableCell>
                <TableCell>{doc.age}</TableCell>
                <TableCell className="max-w-48 text-sm text-muted-foreground">
                  {doc.workDays.map((d) => WEEKDAY_LABELS[d].slice(0, 3)).join(", ")}
                </TableCell>
                <TableCell>
                  {doc.workStartTime}–{doc.workEndTime}
                </TableCell>
                <TableCell>
                  {canManage ? (
                    <Badge
                      variant={doc.isActive ? "secondary" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDoctorActive(doc.id, !doc.isActive).then(() => router.refresh())}
                    >
                      {doc.isActive ? "Faol" : "Nofaol"}
                    </Badge>
                  ) : (
                    <Badge variant={doc.isActive ? "secondary" : "outline"}>{doc.isActive ? "Faol" : "Nofaol"}</Badge>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(doc)}>
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
                            &quot;{doc.fullName}&quot;ni o&apos;chirmoqchimisiz?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => deleteDoctor(doc.id).then(() => router.refresh())}
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
            <DialogTitle>Shifokorni tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>F.I.Sh</Label>
                <Input value={editForm.fullName} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Mutaxassisligi</Label>
                <Input value={editForm.specialty} onChange={(e) => setEditForm((f) => ({ ...f, specialty: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Yoshi</Label>
                <Input type="number" min={20} max={90} value={editForm.age} onChange={(e) => setEditForm((f) => ({ ...f, age: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Ish boshlanishi</Label>
                <Input type="time" value={editForm.workStartTime} onChange={(e) => setEditForm((f) => ({ ...f, workStartTime: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Ish tugashi</Label>
                <Input type="time" value={editForm.workEndTime} onChange={(e) => setEditForm((f) => ({ ...f, workEndTime: e.target.value }))} />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Rasm havolasi</Label>
                <Input value={editForm.photoUrl} onChange={(e) => setEditForm((f) => ({ ...f, photoUrl: e.target.value }))} />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Qisqacha ma&apos;lumot</Label>
                <Input value={editForm.bio} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Ish kunlari</Label>
              <WeekdayPicker value={editForm.workDays} onChange={(v) => setEditForm((f) => ({ ...f, workDays: v }))} />
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
