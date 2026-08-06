"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2, Star, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { createAddress, deleteAddress, setDefaultAddress } from "@/modules/customer/actions";

type Address = {
  id: string;
  label: string | null;
  fullAddress: string;
  isDefault: boolean;
};

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [label, setLabel] = React.useState("");
  const [fullAddress, setFullAddress] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createAddress({
      label,
      fullAddress,
      isDefault: addresses.length === 0,
    });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setLabel("");
    setFullAddress("");
    toast.success("Manzil qo'shildi");
    router.refresh();
  }

  async function handleDelete(id: string) {
    const result = await deleteAddress(id);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Manzil o'chirildi");
    router.refresh();
  }

  async function handleSetDefault(id: string) {
    await setDefaultAddress(id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-2xl border bg-card p-6 portal-shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-medium">Nomi (ixtiyoriy)</label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Uy, Ish..."
            className="h-11 rounded-xl"
          />
        </div>
        <div className="flex flex-[2] flex-col gap-1.5">
          <label className="text-sm font-medium">To&apos;liq manzil</label>
          <Input
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            placeholder="Toshkent, Chilonzor..."
            required
            className="h-11 rounded-xl"
          />
        </div>
        <Button type="submit" disabled={pending} className="h-11 gap-1.5 rounded-full">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Qo&apos;shish
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        {addresses.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Manzillar mavjud emas</p>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex items-center gap-4 rounded-2xl border bg-card p-5 portal-shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                {addr.label && <span className="font-medium">{addr.label}: </span>}
                <span className="text-sm">{addr.fullAddress}</span>
                {addr.isDefault && (
                  <Badge variant="outline" className="ml-2">
                    Asosiy
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!addr.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full"
                    title="Asosiy qilib belgilash"
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button variant="ghost" size="icon-sm" className="rounded-full">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>O&apos;chirishni tasdiqlang</AlertDialogTitle>
                      <AlertDialogDescription>
                        &quot;{addr.fullAddress}&quot; manzilini o&apos;chirmoqchimisiz?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={() => handleDelete(addr.id)}>
                        O&apos;chirish
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
