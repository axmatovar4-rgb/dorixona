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

type Product = { id: string; name: string };

type PromoCode = {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  createdAt: Date;
  products: Product[];
};

export function PromoCodeManager({
  promoCodes,
  products,
  canManage,
}: {
  promoCodes: PromoCode[];
  products: Product[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = React.useState({ code: "", discountPercent: "10" });
  const [selectedProductIds, setSelectedProductIds] = React.useState<string[]>([]);
  const [pending, setPending] = React.useState(false);

  function toggleProduct(id: string) {
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createPromoCode({
      code: form.code,
      discountPercent: Number(form.discountPercent),
      productIds: selectedProductIds,
    });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setForm({ code: "", discountPercent: "10" });
    setSelectedProductIds([]);
    toast.success("Aksiya kodi qo'shildi");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-xl border p-3.5">
          <div className="flex flex-wrap items-end gap-2">
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
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              Qaysi dorilarga tegishli{" "}
              <span className="font-normal text-muted-foreground">
                (hech biri tanlanmasa — barcha savatga qo&apos;llanadi)
              </span>
            </label>
            <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-lg border p-2">
              {products.map((p) => (
                <label key={p.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kod</TableHead>
            <TableHead>Chegirma</TableHead>
            <TableHead>Dorilar</TableHead>
            <TableHead>Holat</TableHead>
            {canManage && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {promoCodes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                Aksiya kodlari mavjud emas
              </TableCell>
            </TableRow>
          ) : (
            promoCodes.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono font-medium">{p.code}</TableCell>
                <TableCell>{p.discountPercent}%</TableCell>
                <TableCell className="max-w-56 text-sm text-muted-foreground">
                  {p.products.length === 0 ? "Barcha savat" : p.products.map((pr) => pr.name).join(", ")}
                </TableCell>
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
