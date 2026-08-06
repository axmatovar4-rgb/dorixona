"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
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
import { createBranch } from "@/modules/inventory/actions";

type Branch = { id: string; name: string; address: string | null; phone: string | null };

export function BranchManager({
  branches,
  canManage,
}: {
  branches: Branch[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createBranch({ name, address, phone });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setName("");
    setAddress("");
    setPhone("");
    toast.success("Filial qo'shildi");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Nomi</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required className="w-48" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Manzil</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} className="w-56" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Telefon</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-40" />
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
            <TableHead>Manzil</TableHead>
            <TableHead>Telefon</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                Filiallar mavjud emas
              </TableCell>
            </TableRow>
          ) : (
            branches.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{b.address || "—"}</TableCell>
                <TableCell>{b.phone || "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
