"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPurchaseOrder } from "@/modules/procurement/actions";

type Option = { id: string; name: string };

type LineItem = { productId: string; name: string; quantity: number; unitPrice: number };

export function PurchaseOrderForm({
  suppliers,
  warehouses,
  products,
}: {
  suppliers: Option[];
  warehouses: Option[];
  products: Option[];
}) {
  const router = useRouter();
  const [supplierId, setSupplierId] = React.useState("");
  const [warehouseId, setWarehouseId] = React.useState("");
  const [productId, setProductId] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [unitPrice, setUnitPrice] = React.useState(0);
  const [items, setItems] = React.useState<LineItem[]>([]);
  const [pending, setPending] = React.useState(false);

  function addItem() {
    const product = products.find((p) => p.id === productId);
    if (!product || quantity <= 0 || unitPrice <= 0) {
      toast.error("Mahsulot, miqdor va narxni to'g'ri kiriting");
      return;
    }
    setItems((prev) => [...prev, { productId, name: product.name, quantity, unitPrice }]);
    setProductId("");
    setQuantity(1);
    setUnitPrice(0);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (!supplierId || !warehouseId) {
      toast.error("Yetkazib beruvchi va omborni tanlang");
      return;
    }
    if (items.length === 0) {
      toast.error("Kamida bitta mahsulot qo'shing");
      return;
    }
    setPending(true);
    const result = await createPurchaseOrder({
      supplierId,
      warehouseId,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
    });
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Xarid buyurtmasi yaratildi");
    setSupplierId("");
    setWarehouseId("");
    setItems([]);
    router.refresh();
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Yetkazib beruvchi</label>
          <Select items={suppliers.map((s) => ({ value: s.id, label: s.name }))} value={supplierId} onValueChange={(v) => setSupplierId(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tanlang" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Ombor</label>
          <Select items={warehouses.map((w) => ({ value: w.id, label: w.name }))} value={warehouseId} onValueChange={(v) => setWarehouseId(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tanlang" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 border-t pt-3">
        <div className="flex flex-1 min-w-40 flex-col gap-1.5">
          <label className="text-sm font-medium">Mahsulot</label>
          <Select items={products.map((p) => ({ value: p.id, label: p.name }))} value={productId} onValueChange={(v) => setProductId(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tanlang" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Miqdor</label>
          <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-24" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Narxi</label>
          <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="w-28" />
        </div>
        <Button type="button" variant="outline" onClick={addItem} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Qo&apos;shish
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t pt-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span>
                {item.name} — {item.quantity} × {item.unitPrice.toLocaleString("uz-UZ")}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{(item.quantity * item.unitPrice).toLocaleString("uz-UZ")}</span>
                <Button variant="ghost" size="icon-sm" onClick={() => removeItem(idx)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 text-sm font-semibold">
            <span>Jami</span>
            <span>{total.toLocaleString("uz-UZ")} so&apos;m</span>
          </div>
        </div>
      )}

      <Button type="button" onClick={handleSubmit} disabled={pending} className="w-fit gap-1.5">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Buyurtma yaratish
      </Button>
    </div>
  );
}
