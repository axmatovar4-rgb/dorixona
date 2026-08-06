"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createLookup, deleteLookup } from "@/modules/pharmacy/actions";

type LookupModel = "category" | "brand" | "manufacturer" | "activeIngredient";

type Item = { id: string; name: string; country?: string | null };

export function LookupManager({
  model,
  items,
  canManage,
  withCountry = false,
}: {
  model: LookupModel;
  items: Item[];
  canManage: boolean;
  withCountry?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData();
    formData.set("name", name);
    if (withCountry) formData.set("country", country);
    const error = await createLookup(model, formData);
    setPending(false);
    if (error) {
      toast.error(error);
      return;
    }
    setName("");
    setCountry("");
    toast.success("Qo'shildi");
    router.refresh();
  }

  async function handleDelete(id: string) {
    const error = await deleteLookup(model, id);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("O'chirildi");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Nomi</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Yangi nom"
              required
              className="w-56"
            />
          </div>
          {withCountry && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Davlat</label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Masalan: O'zbekiston"
                className="w-44"
              />
            </div>
          )}
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
            {withCountry && <TableHead>Davlat</TableHead>}
            {canManage && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                Ma&apos;lumot yo&apos;q
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                {withCountry && <TableCell>{item.country || "—"}</TableCell>}
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
                            &quot;{item.name}&quot;ni o&apos;chirmoqchimisiz? Bu amalni bekor qilib bo&apos;lmaydi.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
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
