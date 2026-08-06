"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createBranchFull, toggleBranchActive } from "@/modules/branches/actions";

type ManagerOption = { id: string; name: string };
type Branch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  manager: { name: string } | null;
  _count: { warehouses: number };
};

export function BranchFullManager({
  branches,
  managers,
  canManage,
}: {
  branches: Branch[];
  managers: ManagerOption[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [managerId, setManagerId] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await createBranchFull({ name, address, phone, managerId });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setName("");
    setAddress("");
    setPhone("");
    setManagerId("");
    toast.success("Filial qo'shildi");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Nomi</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required className="w-44" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Manzil</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} className="w-52" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Telefon</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-36" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Menejer</label>
            <Select items={managers.map((m) => ({ value: m.id, label: m.name }))} value={managerId} onValueChange={(v) => setManagerId(v ?? "")}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Tanlang" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <TableHead>Menejer</TableHead>
            <TableHead>Omborlar</TableHead>
            <TableHead>Holat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                Filiallar mavjud emas
              </TableCell>
            </TableRow>
          ) : (
            branches.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{b.address || "—"}</TableCell>
                <TableCell>{b.phone || "—"}</TableCell>
                <TableCell>{b.manager?.name || "—"}</TableCell>
                <TableCell>{b._count.warehouses}</TableCell>
                <TableCell>
                  {canManage ? (
                    <Badge
                      variant={b.isActive ? "secondary" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleBranchActive(b.id, !b.isActive).then(() => router.refresh())}
                    >
                      {b.isActive ? "Faol" : "Nofaol"}
                    </Badge>
                  ) : (
                    <Badge variant={b.isActive ? "secondary" : "outline"}>{b.isActive ? "Faol" : "Nofaol"}</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
