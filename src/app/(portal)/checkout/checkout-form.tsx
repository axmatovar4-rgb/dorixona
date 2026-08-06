"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  Plus,
  Banknote,
  CreditCard,
  Upload,
  Check,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/modules/customer/cart-context";
import { DELIVERY_FEE } from "@/modules/customer/constants";
import { createOrder, createAddress } from "@/modules/customer/actions";
import { PAYMENT_METHODS } from "@/modules/customer/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageContainer } from "@/modules/customer/components/section";
import { FakePaymentCard } from "@/modules/customer/components/fake-payment-card";
import { cn } from "@/lib/utils";

type Address = {
  id: string;
  label: string | null;
  fullAddress: string;
  isDefault: boolean;
};

const PAYMENT_OPTIONS: { value: (typeof PAYMENT_METHODS)[number]; label: string; icon: typeof Banknote }[] = [
  { value: "CASH_ON_DELIVERY", label: "Naqd (yetkazishda)", icon: Banknote },
  { value: "CLICK", label: "Click", icon: CreditCard },
  { value: "PAYME", label: "Payme", icon: CreditCard },
  { value: "UZCARD", label: "Uzcard", icon: CreditCard },
  { value: "HUMO", label: "Humo", icon: CreditCard },
];

export function CheckoutForm({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const { items, subtotal, requiresPrescription, clear } = useCart();

  const [addressId, setAddressId] = React.useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ""
  );
  const [showNewAddress, setShowNewAddress] = React.useState(addresses.length === 0);
  const [newAddress, setNewAddress] = React.useState("");
  const [savingAddress, setSavingAddress] = React.useState(false);

  React.useEffect(() => {
    if (!addresses.some((a) => a.id === addressId)) {
      setAddressId(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "");
    }
    if (addresses.length > 0) setShowNewAddress(false);
  }, [addresses, addressId]);

  const [paymentMethod, setPaymentMethod] =
    React.useState<(typeof PAYMENT_METHODS)[number]>("CASH_ON_DELIVERY");
  const [onlinePaymentValid, setOnlinePaymentValid] = React.useState(false);
  const [prescriptionImageUrl, setPrescriptionImageUrl] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const total = subtotal + DELIVERY_FEE;
  const isOnlinePayment = paymentMethod !== "CASH_ON_DELIVERY";
  const canSubmit = !isOnlinePayment || onlinePaymentValid;

  async function handleAddAddress() {
    if (newAddress.trim().length < 5) {
      toast.error("To'liq manzilni kiriting");
      return;
    }
    setSavingAddress(true);
    const result = await createAddress({
      fullAddress: newAddress,
      isDefault: addresses.length === 0,
      label: "",
    });
    setSavingAddress(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Manzil qo'shildi");
    router.refresh();
    setShowNewAddress(false);
    setNewAddress("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPrescriptionImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!addressId) {
      toast.error("Yetkazib berish manzilini tanlang");
      return;
    }
    if (requiresPrescription && !prescriptionImageUrl) {
      toast.error("Retsept rasmini yuklang");
      return;
    }
    if (isOnlinePayment && !onlinePaymentValid) {
      toast.error("To'lov ma'lumotlarini to'g'ri kiriting");
      return;
    }
    setSubmitting(true);
    const result = await createOrder({
      addressId,
      paymentMethod,
      prescriptionImageUrl,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    clear();
    toast.success("Buyurtma qabul qilindi!");
    router.push(`/orders/${result!.orderId}`);
  }

  if (items.length === 0) {
    return (
      <PageContainer className="flex flex-col items-center gap-4 py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
          <ShoppingBag className="h-9 w-9 text-primary" />
        </div>
        <p className="text-muted-foreground">Savatingiz bo&apos;sh</p>
        <Button className="gap-1.5 rounded-full" render={<Link href="/shop" />}>
          Do&apos;konga o&apos;tish
          <ArrowRight className="h-4 w-4" />
        </Button>
      </PageContainer>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="rounded-2xl border bg-card p-6 portal-shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <MapPin className="h-4 w-4 text-primary" />
            Yetkazib berish manzili
          </h2>
          <div className="flex flex-col gap-2.5">
            {addresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => setAddressId(addr.id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3.5 text-left text-sm transition-all hover:border-primary/40",
                  addressId === addr.id ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    addressId === addr.id ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                  )}
                >
                  {addressId === addr.id && <Check className="h-3 w-3" />}
                </span>
                <span className="flex-1">
                  {addr.label && <span className="font-medium">{addr.label}: </span>}
                  {addr.fullAddress}
                </span>
                {addr.isDefault && <Badge variant="outline">Asosiy</Badge>}
              </button>
            ))}

            {showNewAddress ? (
              <div className="flex flex-col gap-2 rounded-2xl border p-3.5">
                <Input
                  placeholder="To'liq manzilni kiriting"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="rounded-xl"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowNewAddress(false)}>
                    Bekor qilish
                  </Button>
                  <Button size="sm" className="rounded-full" onClick={handleAddAddress} disabled={savingAddress}>
                    {savingAddress && <Loader2 className="h-4 w-4 animate-spin" />}
                    Saqlash
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-fit gap-1.5 rounded-full"
                onClick={() => setShowNewAddress(true)}
              >
                <Plus className="h-4 w-4" />
                Yangi manzil qo&apos;shish
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 portal-shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <CreditCard className="h-4 w-4 text-primary" />
            To&apos;lov usuli
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setPaymentMethod(opt.value);
                  setOnlinePaymentValid(false);
                }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center text-sm font-medium transition-all hover:border-primary/40",
                  paymentMethod === opt.value ? "border-primary bg-primary/5 text-primary" : "border-border"
                )}
              >
                <opt.icon className="h-5 w-5" />
                {opt.label}
              </button>
            ))}
          </div>
          {paymentMethod === "CASH_ON_DELIVERY" ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Banknote className="h-3.5 w-3.5" />
              Kuryer yetkazib berganda naqd pulda to&apos;laysiz.
            </p>
          ) : (
            <FakePaymentCard
              key={paymentMethod}
              providerLabel={PAYMENT_OPTIONS.find((o) => o.value === paymentMethod)?.label ?? ""}
              amount={total}
              onValidChange={setOnlinePaymentValid}
            />
          )}

          {requiresPrescription && (
            <div className="mt-4 flex flex-col gap-2 border-t pt-4">
              <h2 className="flex items-center gap-2 font-medium">
                <Upload className="h-4 w-4 text-primary" />
                Retsept rasmi
              </h2>
              <p className="text-xs text-muted-foreground">
                Savatingizda retsept talab qilinadigan dori bor. Retsept rasmini yuklang.
              </p>
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="text-sm" />
              {prescriptionImageUrl && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Fayl yuklandi</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="h-fit rounded-2xl border bg-card p-6 portal-shadow-sm lg:sticky lg:top-24">
        <h2 className="mb-4 font-semibold">Buyurtma tafsilotlari</h2>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.name} × {item.quantity}
              </span>
              <span>{(item.sellPrice * item.quantity).toLocaleString("uz-UZ")}</span>
            </div>
          ))}
          <Separator className="my-1" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mahsulotlar</span>
            <span>{subtotal.toLocaleString("uz-UZ")} so&apos;m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Yetkazib berish</span>
            <span>{DELIVERY_FEE.toLocaleString("uz-UZ")} so&apos;m</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between text-lg font-bold">
            <span>Jami</span>
            <span>{total.toLocaleString("uz-UZ")} so&apos;m</span>
          </div>
        </div>
        <Button
          className="mt-5 h-12 w-full gap-1.5 rounded-full text-base"
          onClick={handleSubmit}
          disabled={submitting || !canSubmit}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Buyurtmani tasdiqlash
        </Button>
      </div>
    </div>
  );
}
