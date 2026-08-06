"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { productSchema, type ProductInput } from "@/modules/pharmacy/schemas";
import { createProduct, updateProduct } from "@/modules/pharmacy/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

type Lookup = { id: string; name: string };

export function ProductForm({
  productId,
  defaultValues,
  categories,
  brands,
  manufacturers,
  activeIngredients,
}: {
  productId?: string;
  defaultValues?: Partial<ProductInput>;
  categories: Lookup[];
  brands: Lookup[];
  manufacturers: Lookup[];
  activeIngredients: Lookup[];
}) {
  const router = useRouter();
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      barcode: "",
      categoryId: "",
      brandId: "",
      manufacturerId: "",
      activeIngredientId: "",
      dosage: "",
      unit: "",
      prescriptionRequired: false,
      imageUrl: "",
      description: "",
      purchasePrice: 0,
      sellPrice: 0,
      minStock: 0,
      maxStock: 0,
      stockMethod: "FEFO",
      isActive: true,
      ...defaultValues,
    },
  });

  async function onSubmit(values: ProductInput) {
    const result = productId
      ? await updateProduct(productId, values)
      : await createProduct(values);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(productId ? "Mahsulot yangilandi" : "Mahsulot qo'shildi");
    router.push(`/pharmacy/products/${result!.id}`);
    router.refresh();
  }

  const lookupSelect = (
    name: "categoryId" | "brandId" | "manufacturerId" | "activeIngredientId",
    label: string,
    options: Lookup[]
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            items={options.map((o) => ({ value: o.id, label: o.name }))}
            value={field.value || undefined}
            onValueChange={(v) => field.onChange(v)}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tanlanmagan" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: Parasetamol 500mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barkod</FormLabel>
                  <FormControl>
                    <Input placeholder="4780000000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O&apos;lchov birligi</FormLabel>
                  <FormControl>
                    <Input placeholder="tabletka, flakon, ampula..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {lookupSelect("categoryId", "Kategoriya", categories)}
            {lookupSelect("brandId", "Brend", brands)}
            {lookupSelect("manufacturerId", "Ishlab chiqaruvchi", manufacturers)}
            {lookupSelect("activeIngredientId", "Faol modda", activeIngredients)}

            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dozalash</FormLabel>
                  <FormControl>
                    <Input placeholder="500mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stockMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ombor strategiyasi</FormLabel>
                  <Select
                    items={[
                      { value: "FEFO", label: "FEFO (muddati bo'yicha)" },
                      { value: "FIFO", label: "FIFO (kirim tartibida)" },
                    ]}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FEFO">FEFO (muddati bo&apos;yicha)</SelectItem>
                      <SelectItem value="FIFO">FIFO (kirim tartibida)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xarid narxi</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
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

            <FormField
              control={form.control}
              name="sellPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sotuv narxi</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
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

            <FormField
              control={form.control}
              name="minStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimal qoldiq</FormLabel>
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

            <FormField
              control={form.control}
              name="maxStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maksimal qoldiq</FormLabel>
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

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Rasm URL (ixtiyoriy)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Tavsif</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prescriptionRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel className="!mt-0">Retsept talab qilinadi</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel className="!mt-0">Faol</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Bekor qilish
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {productId ? "Saqlash" : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
