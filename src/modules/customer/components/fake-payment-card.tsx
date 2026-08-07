"use client";

import * as React from "react";
import { CreditCard, AlertTriangle, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CardType = "SIMPLE" | "VISA";

function formatCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatAmountInput(raw: string) {
  return raw.replace(/\D/g, "");
}

export function FakePaymentCard({
  providerLabel,
  amount,
  onValidChange,
  forceCardType,
}: {
  providerLabel: string;
  amount: number;
  onValidChange: (valid: boolean) => void;
  forceCardType?: CardType;
}) {
  const [cardType, setCardType] = React.useState<CardType>(forceCardType ?? "SIMPLE");
  const [cardNumber, setCardNumber] = React.useState("");
  const [expiry, setExpiry] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [amountInput, setAmountInput] = React.useState(String(amount));

  const cardDigits = cardNumber.replace(/\D/g, "");
  const cardValid = cardDigits.length === 16;
  const expiryValid = /^\d{2}\/\d{2}$/.test(expiry);
  const cvvValid = cardType === "SIMPLE" || cvv.length === 3;
  const enteredAmount = Number(amountInput || 0);
  const amountValid = enteredAmount === amount;

  const isValid = cardValid && expiryValid && cvvValid && amountValid;

  React.useEffect(() => {
    onValidChange(isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid]);

  React.useEffect(() => {
    setAmountInput(String(amount));
  }, [amount]);

  return (
    <div className="mt-3 flex flex-col gap-4 rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <CreditCard className="h-4 w-4 text-primary" />
          {providerLabel} orqali to&apos;lov
        </p>
        {!forceCardType && (
          <div className="flex items-center gap-1 rounded-full bg-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setCardType("SIMPLE")}
              className={cn(
                "rounded-full px-3 py-1 font-medium transition-colors",
                cardType === "SIMPLE" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
              )}
            >
              Oddiy karta
            </button>
            <button
              type="button"
              onClick={() => setCardType("VISA")}
              className={cn(
                "rounded-full px-3 py-1 font-medium transition-colors",
                cardType === "VISA" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
              )}
            >
              Visa / Mastercard
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Karta raqami</Label>
          <Input
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="rounded-xl font-mono tracking-wider"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Amal qilish muddati</Label>
          <Input
            inputMode="numeric"
            placeholder="OO/YY"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            className="rounded-xl"
          />
        </div>
        {cardType === "VISA" && (
          <div className="flex flex-col gap-1.5">
            <Label>CVV</Label>
            <Input
              inputMode="numeric"
              placeholder="000"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
              className="rounded-xl font-mono"
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>To&apos;lov summasi</Label>
          <div className="relative">
            <Input
              inputMode="numeric"
              value={Number(amountInput || 0).toLocaleString("uz-UZ")}
              onChange={(e) => setAmountInput(formatAmountInput(e.target.value))}
              className={cn(
                "rounded-xl pr-14",
                !amountValid && amountInput !== "" && "border-destructive focus-visible:ring-destructive/30"
              )}
            />
            <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs text-muted-foreground">
              so&apos;m
            </span>
          </div>
        </div>
      </div>

      {!amountValid ? (
        <p className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Kiritilgan summa buyurtma summasiga ({amount.toLocaleString("uz-UZ")} so&apos;m) mos kelishi
          kerak — {enteredAmount > amount ? "ko'p" : "kam"} kiritdingiz.
        </p>
      ) : isValid ? (
        <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          To&apos;lov ma&apos;lumotlari tayyor.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Davom etish uchun karta raqami{cardType === "VISA" ? ", muddati va CVV" : " va muddatini"} to&apos;liq kiriting.
        </p>
      )}
    </div>
  );
}
