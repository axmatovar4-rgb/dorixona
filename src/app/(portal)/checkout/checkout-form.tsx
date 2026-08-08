"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  Plus,
  CreditCard,
  Check,
  ArrowRight,
  ShoppingBag,
  LocateFixed,
  MessageSquareText,
  Tag,
  X,
  Truck,
  Store,
} from "lucide-react";
import { useCart } from "@/modules/customer/cart-context";
import { DELIVERY_FEE } from "@/modules/customer/constants";
import { createOrder, createAddress } from "@/modules/customer/actions";
import { detectCurrentAddress } from "@/modules/customer/geolocation";
import { PAYMENT_METHODS, DELIVERY_METHODS } from "@/modules/customer/schemas";
import { checkPromoCode } from "@/modules/promo/actions";
import { PaymeLogo, ClickLogo, HumoLogo, UzcardLogo, VisaLogo, CashCoinIcon } from "@/components/payment-logos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageContainer } from "@/modules/customer/components/section";
import { FakePaymentCard } from "@/modules/customer/components/fake-payment-card";
import { BranchPicker, type BranchOption } from "@/modules/customer/components/branch-picker";
import { cn } from "@/lib/utils";

type Address = {
  id: string;
  label: string | null;
  fullAddress: string;
  isDefault: boolean;
};

type Zone = { id: string; name: string; fee: number; isDefault: boolean };

const PAYMENT_OPTIONS: {
  value: (typeof PAYMENT_METHODS)[number];
  label: string;
  logo: (props: { className?: string }) => React.ReactElement;
}[] = [
  { value: "CASH_ON_DELIVERY", label: "Naqd (yetkazishda)", logo: CashCoinIcon },
  { value: "CLICK", label: "Click", logo: ClickLogo },
  { value: "PAYME", label: "Payme", logo: PaymeLogo },
  { value: "UZCARD", label: "Uzcard", logo: UzcardLogo },
  { value: "HUMO", label: "Humo", logo: HumoLogo },
  { value: "VISA", label: "Visa", logo: VisaLogo },
];

export function CheckoutForm({
  addresses,
  zones,
  branches,
}: {
  addresses: Address[];
  zones: Zone[];
  branches: BranchOption[];
}) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();

  const [deliveryMethod, setDeliveryMethod] = React.useState<(typeof DELIVERY_METHODS)[number]>("DELIVERY");
  const [pickupBranchId, setPickupBranchId] = React.useState("");

  const [addressId, setAddressId] = React.useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ""
  );
  const [zoneId, setZoneId] = React.useState(
    zones.find((z) => z.isDefault)?.id ?? zones[0]?.id ?? ""
  );
  const selectedZone = zones.find((z) => z.id === zoneId);
  const deliveryFee = deliveryMethod === "PICKUP" ? 0 : selectedZone ? selectedZone.fee : DELIVERY_FEE;
  const [showNewAddress, setShowNewAddress] = React.useState(addresses.length === 0);
  const [newAddress, setNewAddress] = React.useState("");
  const [savingAddress, setSavingAddress] = React.useState(false);
  const [detecting, setDetecting] = React.useState(false);

  async function handleDetectLocation() {
    setDetecting(true);
    try {
      const address = await detectCurrentAddress();
      setNewAddress(address);
      toast.success("Manzil aniqlandi — kerak bo'lsa tahrirlab, saqlang");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Manzilni aniqlab bo'lmadi");
    } finally {
      setDetecting(false);
    }
  }

  React.useEffect(() => {
    if (!addresses.some((a) => a.id === addressId)) {
      setAddressId(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "");
    }
    if (addresses.length > 0) setShowNewAddress(false);
  }, [addresses, addressId]);

  const [paymentMethod, setPaymentMethod] =
    React.useState<(typeof PAYMENT_METHODS)[number]>("CASH_ON_DELIVERY");
  const [onlinePaymentValid, setOnlinePaymentValid] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [courierNote, setCourierNote] = React.useState("");
  const [promoInput, setPromoInput] = React.useState("");
  const [appliedPromo, setAppliedPromo] = React.useState<{
    code: string;
    discountPercent: number;
    productIds: string[];
  } | null>(null);
  const [applyingPromo, setApplyingPromo] = React.useState(false);

  const promoEligibleSubtotal = appliedPromo
    ? appliedPromo.productIds.length > 0
      ? items
          .filter((i) => appliedPromo.productIds.includes(i.productId))
          .reduce((sum, i) => sum + i.sellPrice * i.quantity, 0)
      : subtotal
    : 0;
  const discountAmount = appliedPromo ? Math.round((promoEligibleSubtotal * appliedPromo.discountPercent) / 100) : 0;
  const total = subtotal - discountAmount + deliveryFee;
  const isOnlinePayment = paymentMethod !== "CASH_ON_DELIVERY";
  const canSubmit = !isOnlinePayment || onlinePaymentValid;

  async function handleApplyPromo() {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    const result = await checkPromoCode(promoInput);
    setApplyingPromo(false);
    if (!result.valid) {
      toast.error(result.error);
      return;
    }
    if (result.productIds.length > 0 && !items.some((i) => result.productIds.includes(i.productId))) {
      toast.error("Bu kod savatingizdagi mahsulotlarga tegishli emas");
      return;
    }
    setAppliedPromo({ code: result.code, discountPercent: result.discountPercent, productIds: result.productIds });
    toast.success(`Aksiya kodi qo'llandi: -${result.discountPercent}%`);
  }

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

  async function handleSubmit() {
    if (deliveryMethod === "DELIVERY" && !addressId) {
      toast.error("Yetkazib berish manzilini tanlang");
      return;
    }
    if (deliveryMethod === "PICKUP" && !pickupBranchId) {
      toast.error("Filialni tanlang");
      return;
    }
    if (isOnlinePayment && !onlinePaymentValid) {
      toast.error("To'lov ma'lumotlarini to'g'ri kiriting");
      return;
    }
    setSubmitting(true);
    const result = await createOrder({
      deliveryMethod,
      addressId: deliveryMethod === "DELIVERY" ? addressId : "",
      pickupBranchId: deliveryMethod === "PICKUP" ? pickupBranchId : "",
      paymentMethod,
      courierNote: courierNote.trim(),
      promoCode: appliedPromo?.code ?? "",
      deliveryZoneId: deliveryMethod === "DELIVERY" ? zoneId || "" : "",
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
            Buyurtmani qanday olasiz?
          </h2>
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setDeliveryMethod("DELIVERY")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-sm font-medium transition-all hover:border-primary/40",
                deliveryMethod === "DELIVERY" ? "border-primary bg-primary/5 text-primary" : "border-border"
              )}
            >
              <Truck className="h-4 w-4" />
              Uyimga yetkazish
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMethod("PICKUP")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-sm font-medium transition-all hover:border-primary/40",
                deliveryMethod === "PICKUP" ? "border-primary bg-primary/5 text-primary" : "border-border"
              )}
            >
              <Store className="h-4 w-4" />
              Filialdan olib ketish
            </button>
          </div>

          {deliveryMethod === "PICKUP" ? (
            <BranchPicker branches={branches} value={pickupBranchId} onChange={setPickupBranchId} />
          ) : (
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={detecting}
                  onClick={handleDetectLocation}
                  className="w-fit gap-1.5 rounded-full"
                >
                  {detecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
                  Joriy manzilimni aniqlash
                </Button>
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
          )}

          {deliveryMethod === "DELIVERY" && (
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium">
                <MessageSquareText className="h-4 w-4 text-primary" />
                Kuryerga izoh (ixtiyoriy)
              </label>
              <Textarea
                placeholder="Masalan: eshik oldiga qo'ying, domofon ishlamaydi va h.k."
                value={courierNote}
                onChange={(e) => setCourierNote(e.target.value)}
                maxLength={300}
                className="rounded-xl"
                rows={2}
              />
            </div>
          )}
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
                  "flex flex-col items-center justify-center gap-2 rounded-2xl border bg-white p-4 text-center text-sm font-medium transition-all hover:border-primary/40",
                  paymentMethod === opt.value ? "border-primary ring-2 ring-primary/20" : "border-border"
                )}
              >
                <opt.logo className="max-w-full" />
                {opt.value === "CASH_ON_DELIVERY" && <span>{opt.label}</span>}
              </button>
            ))}
          </div>
          {paymentMethod === "CASH_ON_DELIVERY" ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CashCoinIcon className="h-3.5 w-3.5" />
              Kuryer yetkazib berganda naqd pulda to&apos;laysiz.
            </p>
          ) : (
            <FakePaymentCard
              key={paymentMethod}
              providerLabel={PAYMENT_OPTIONS.find((o) => o.value === paymentMethod)?.label ?? ""}
              amount={total}
              onValidChange={setOnlinePaymentValid}
              forceCardType={paymentMethod === "VISA" ? "VISA" : undefined}
            />
          )}
        </div>
      </div>

      <div className="h-fit rounded-2xl border bg-card p-6 portal-shadow-sm lg:sticky lg:top-24">
        <h2 className="mb-4 font-semibold">Buyurtma tafsilotlari</h2>

        <div className="mb-4 flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium">
            <Tag className="h-4 w-4 text-primary" />
            Aksiya kodi
          </label>
          {appliedPromo ? (
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
              <span className="font-mono font-semibold text-primary">
                {appliedPromo.code} · -{appliedPromo.discountPercent}%
              </span>
              <button
                type="button"
                onClick={() => {
                  setAppliedPromo(null);
                  setPromoInput("");
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Masalan: YANGI10"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                className="rounded-xl font-mono uppercase"
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 rounded-xl"
                disabled={applyingPromo || !promoInput.trim()}
                onClick={handleApplyPromo}
              >
                {applyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Qo'llash"}
              </Button>
            </div>
          )}
        </div>

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
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
              <span>Aksiya chegirmasi</span>
              <span>-{discountAmount.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>
          )}
          {deliveryMethod === "PICKUP" ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Filialdan olib ketish</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Bepul</span>
            </div>
          ) : zones.length > 0 ? (
            <div className="flex flex-col gap-1.5 py-1">
              <span className="text-sm text-muted-foreground">Yetkazib berish hududi</span>
              <div className="flex items-center justify-between gap-2">
                <Select items={zones.map((z) => ({ value: z.id, label: z.name }))} value={zoneId} onValueChange={(v) => setZoneId(v as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="shrink-0 text-sm font-medium">{deliveryFee.toLocaleString("uz-UZ")} so&apos;m</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Yetkazib berish</span>
              <span>{deliveryFee.toLocaleString("uz-UZ")} so&apos;m</span>
            </div>
          )}
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
