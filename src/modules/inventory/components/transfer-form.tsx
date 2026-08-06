"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, ArrowLeftRight } from "lucide-react";
import { transferSchema, type TransferInput } from "@/modules/inventory/schemas";
import { transferStock } from "@/modules/inventory/actions";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

type Option = { id: string; name: string };
type Batch = { id: string; batchNumber: string; expiryDate: string; quantity: number };

export function TransferForm({
  products,
  warehouses,
}: {
  products: Option[];
  warehouses: Option[];
}) {
  const router = useRouter();
  const [batches, setBatches] = React.useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = React.useState(false);

  const form = useForm<TransferInput>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      productId: "",
      batchId: "",
      fromWarehouseId: "",
      toWarehouseId: "",
      quantity: 0,
    },
  });

  const productId = form.watch("productId");
  const fromWarehouseId = form.watch("fromWarehouseId");

  React.useEffect(() => {
    if (!productId || !fromWarehouseId) {
      setBatches([]);
      return;
    }
    setLoadingBatches(true);
    form.setValue("batchId", "");
    fetch(`/api/inventory/batches?productId=${productId}&warehouseId=${fromWarehouseId}`)
      .then((res) => res.json())
      .then((json) => setBatches(json.data ?? []))
      .finally(() => setLoadingBatches(false));
  }, [productId, fromWarehouseId, form]);

  async function onSubmit(values: TransferInput) {
    const result = await transferStock(values);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Transfer bajarildi");
    form.reset({ productId: "", batchId: "", fromWarehouseId: "", toWarehouseId: "", quantity: 0 });
    setBatches([]);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Mahsulot</FormLabel>
                  <Select
                    items={products.map((p) => ({ value: p.id, label: p.name }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Mahsulotni tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fromWarehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qaysi ombordan</FormLabel>
                  <Select
                    items={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Manba ombor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toWarehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qaysi omborga</FormLabel>
                  <Select
                    items={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Qabul qiluvchi ombor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="batchId"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Partiya {loadingBatches && "(yuklanmoqda...)"}</FormLabel>
                  <Select
                    items={batches.map((b) => ({
                      value: b.id,
                      label: `${b.batchNumber} · muddati ${format(new Date(b.expiryDate), "dd.MM.yyyy")} · qoldiq ${b.quantity}`,
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!productId || !fromWarehouseId || batches.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            !productId || !fromWarehouseId
                              ? "Avval mahsulot va manba omborni tanlang"
                              : batches.length === 0
                                ? "Bu omborda qoldiq yo'q"
                                : "Partiyani tanlang"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {batches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.batchNumber} · muddati {format(new Date(b.expiryDate), "dd.MM.yyyy")} · qoldiq {b.quantity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Miqdor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting} className="gap-1.5">
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowLeftRight className="h-4 w-4" />
            )}
            Transfer qilish
          </Button>
        </div>
      </form>
    </Form>
  );
}
