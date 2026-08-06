"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createWarehouse } from "@/modules/inventory/actions";

type Branch = { id: string; name: string };
type Warehouse = { id: string; name: string; location: string | null; branch: Branch };

export function WarehouseManager({
  warehouses,
  branches,
  canManage,
}: {
  warehouses: Warehouse[];
  branches: Branch[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [branchId, setBranchId] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!branchId) {
      toast.error("Filialni tanlang");
      return;
    }
    setPending(true);
    const result = await createWarehouse({ name, location, branchId });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setName("");
    setLocation("");
    setBranchId("");
    toast.success("Ombor qo'shildi");
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
            <label className="text-sm font-medium">Joylashuv</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="w-48" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Filial</label>
            <Select
              items={branches.map((b) => ({ value: b.id, label: b.name }))}
              value={branchId}
              onValueChange={(v) => setBranchId(v ?? "")}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filialni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
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
            <TableHead>Filial</TableHead>
            <TableHead>Joylashuv</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                Omborlar mavjud emas
              </TableCell>
            </TableRow>
          ) : (
            warehouses.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.name}</TableCell>
                <TableCell>{w.branch.name}</TableCell>
                <TableCell>{w.location || "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
