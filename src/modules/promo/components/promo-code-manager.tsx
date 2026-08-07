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
import { createPromoCode, deletePromoCode, togglePromoCodeActive } from "@/modules/promo/actions";

type PromoCode = {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  createdAt: Date;
};

export function PromoCodeManager({ promoCodes, canManage }: { promoCodes: PromoCode[]; canManage: boolean }) {
  const router = useRouter();
  const [form, setForm] = React.useState({ code: "", discountPercent: "10" });
  const [pending, setPending] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createPromoCode({
      code: form.code,
      discountPercent: Number(form.discountPercent),
    });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setForm({ code: "", discountPercent: "10" });
    toast.success("Aksiya kodi qo'shildi");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Kod</label>
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="YANGI10"
              required
              className="w-40 font-mono uppercase"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Chegirma (%)</label>
            <Input
              type="number"
              min={1}
              max={90}
              value={form.discountPercent}
              onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
              required
              className="w-28"
            />
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
            <TableHead>Kod</TableHead>
            <TableHead>Chegirma</TableHead>
            <TableHead>Holat</TableHead>
            {canManage && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {promoCodes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                Aksiya kodlari mavjud emas
              </TableCell>
            </TableRow>
          ) : (
            promoCodes.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono font-medium">{p.code}</TableCell>
                <TableCell>{p.discountPercent}%</TableCell>
                <TableCell>
                  {canManage ? (
                    <Badge
                      variant={p.isActive ? "secondary" : "outline"}
                      className="cursor-pointer"
                      onClick={() => togglePromoCodeActive(p.id, !p.isActive).then(() => router.refresh())}
                    >
                      {p.isActive ? "Faol" : "Nofaol"}
                    </Badge>
                  ) : (
                    <Badge variant={p.isActive ? "secondary" : "outline"}>{p.isActive ? "Faol" : "Nofaol"}</Badge>
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
                            &quot;{p.code}&quot; kodini o&apos;chirmoqchimisiz?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => deletePromoCode(p.id).then(() => router.refresh())}
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
