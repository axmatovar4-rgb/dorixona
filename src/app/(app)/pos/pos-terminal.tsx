"use client";

import * as React from "react";
import { toast } from "sonner";
import { Camera, CameraOff, Loader2, Minus, Plus, ScanBarcode, ShoppingCart, Trash2, Wallet, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { lookupProductByBarcode, createPosSale } from "@/modules/pos/actions";
import type { PosPaymentMethod } from "@prisma/client";

type CartItem = {
  productId: string;
  name: string;
  dosage: string | null;
  unit: string;
  sellPrice: number;
  inStock: number;
  quantity: number;
};

const PAYMENT_METHODS: { value: PosPaymentMethod; label: string; icon: typeof Wallet }[] = [
  { value: "CASH", label: "Naqd", icon: Wallet },
  { value: "CARD", label: "Karta", icon: CreditCard },
];

export function PosTerminal() {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = React.useState("");
  const [looking, setLooking] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<PosPaymentMethod>("CASH");
  const [submitting, setSubmitting] = React.useState(false);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const controlsRef = React.useRef<{ stop: () => void } | null>(null);
  const lastScanRef = React.useRef<{ code: string; at: number }>({ code: "", at: 0 });
  const barcodeInputRef = React.useRef<HTMLInputElement>(null);

  const addToCart = React.useCallback((product: {
    id: string;
    name: string;
    dosage: string | null;
    unit: string;
    sellPrice: number;
    inStock: number;
  }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.inStock) {
          toast.error(`${product.name} — omborda faqat ${product.inStock} ta qoldi`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.inStock < 1) {
        toast.error(`${product.name} — omborda mavjud emas`);
        return prev;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          dosage: product.dosage,
          unit: product.unit,
          sellPrice: product.sellPrice,
          inStock: product.inStock,
          quantity: 1,
        },
      ];
    });
  }, []);

  const handleBarcode = React.useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;
      setLooking(true);
      const result = await lookupProductByBarcode(trimmed);
      setLooking(false);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.product) {
        addToCart(result.product);
        toast.success(`${result.product.name} savatga qo'shildi`);
      }
    },
    [addToCart]
  );

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = barcodeInput;
    setBarcodeInput("");
    await handleBarcode(code);
    barcodeInputRef.current?.focus();
  }

  React.useEffect(() => {
    if (!scanning) return;
    let cancelled = false;
    setCameraError(null);

    Promise.all([import("@zxing/browser"), import("@zxing/library")]).then(
      ([{ BrowserMultiFormatReader }, { DecodeHintType, BarcodeFormat }]) => {
        if (cancelled || !videoRef.current) return;

        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.CODE_128,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        const reader = new BrowserMultiFormatReader(hints);
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        };

        reader
          .decodeFromConstraints(constraints, videoRef.current, (result) => {
            if (!result) return;
            const code = result.getText();
            const now = Date.now();
            if (code === lastScanRef.current.code && now - lastScanRef.current.at < 2500) return;
            lastScanRef.current = { code, at: now };
            void handleBarcode(code);
          })
          .then((controls) => {
            if (cancelled) {
              controls.stop();
              return;
            }
            controlsRef.current = controls;
          })
          .catch((err) => {
            if (cancelled) return;
            setCameraError(err instanceof Error ? err.message : "Kamerani ochib bo'lmadi");
            setScanning(false);
          });
      }
    );

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [scanning, handleBarcode]);

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = item.quantity + delta;
          if (nextQty > item.inStock) {
            toast.error(`Omborda faqat ${item.inStock} ta bor`);
            return item;
          }
          return { ...item, quantity: nextQty };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  const total = cart.reduce((sum, item) => sum + item.sellPrice * item.quantity, 0);

  async function handleCheckout() {
    if (cart.length === 0) return;
    setSubmitting(true);
    const result = await createPosSale({
      paymentMethod,
      items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Sotuv yakunlandi — ${total.toLocaleString("uz-UZ")} so'm`);
    setCart([]);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="flex flex-col gap-4 lg:col-span-3">
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ScanBarcode className="h-4 w-4 text-primary" />
              Shtrix-kod skaneri
            </h2>
            <Button
              type="button"
              size="sm"
              variant={scanning ? "destructive" : "default"}
              className="gap-1.5 rounded-full"
              onClick={() => setScanning((s) => !s)}
            >
              {scanning ? <CameraOff className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
              {scanning ? "Kamerani o'chirish" : "Kamerani yoqish"}
            </Button>
          </div>

          {scanning && (
            <div className="mb-3 flex flex-col gap-2">
              <div className="relative overflow-hidden rounded-xl border bg-black">
                <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-[85%] max-w-md rounded-lg border-2 border-primary/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Shtrix-kodni <strong>tekis va qiyalatmasdan</strong>, yuqoridagi ramka ichiga to&apos;g&apos;ri
                joylashtiring. Ekranni yaltiratmang, yorug&apos;lik yetarli bo&apos;lsin.
              </p>
            </div>
          )}
          {cameraError && (
            <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Kameraga ruxsat berilmadi yoki topilmadi: {cameraError}
            </p>
          )}

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              ref={barcodeInputRef}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Shtrix-kodni qo'lda kiriting..."
              autoFocus
            />
            <Button type="submit" disabled={looking || !barcodeInput.trim()} className="gap-1.5">
              {looking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Qo&apos;shish
            </Button>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <ShoppingCart className="h-4 w-4 text-primary" />
            Savat {cart.length > 0 && `(${cart.length})`}
          </h2>

          {cart.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Savat bo&apos;sh — shtrix-kodni skanerlang yoki kiriting
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-2 text-sm">
                  <div className="flex-1">
                    <p className="font-medium leading-tight">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.dosage ? `${item.dosage} · ` : ""}
                      {item.sellPrice.toLocaleString("uz-UZ")} so&apos;m / {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(item.productId, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 rounded-full"
                      onClick={() => updateQuantity(item.productId, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="w-20 text-right font-semibold">
                    {(item.sellPrice * item.quantity).toLocaleString("uz-UZ")}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Separator className="my-4" />

          <div className="mb-3 flex gap-2">
            {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-sm font-medium transition-colors",
                  paymentMethod === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="mb-3 flex items-center justify-between text-lg font-bold">
            <span>Jami</span>
            <span>{total.toLocaleString("uz-UZ")} so&apos;m</span>
          </div>

          <Button
            type="button"
            className="w-full gap-1.5 rounded-full"
            size="lg"
            disabled={cart.length === 0 || submitting}
            onClick={handleCheckout}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sotuvni yakunlash
          </Button>
        </div>
      </div>
    </div>
  );
}
