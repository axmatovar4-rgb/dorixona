"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordReset, confirmPasswordReset } from "@/modules/customer/actions";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = React.useState<"phone" | "code">("phone");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await requestPasswordReset(phone.trim());
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    toast.success("Kod Telegram'ga yuborildi");
    setStep("code");
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Parollar mos kelmadi");
      return;
    }
    setPending(true);
    setError("");
    const result = await confirmPasswordReset(phone.trim(), code.trim(), newPassword);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    toast.success("Parol muvaffaqiyatli o'zgartirildi, endi tizimga kiring");
    router.push("/login");
  }

  return (
    <Card className="portal-shadow-lg w-full max-w-sm border-primary/10 backdrop-blur-sm">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-xl">Parolni tiklash</CardTitle>
        <CardDescription>
          {step === "phone"
            ? "Telefon raqamingizni kiriting — Telegram'ga tasdiqlash kodi yuboriladi"
            : "Telegram'ga kelgan kodni va yangi parolni kiriting"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "phone" ? (
          <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefon raqam</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
                required
                autoComplete="tel"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full gap-1.5" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Kod yuborish
            </Button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Telegram&apos;dan kelgan kod</Label>
              <Input
                id="code"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                required
                className="font-mono tracking-widest"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Yangi parol</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Yangi parolni takrorlang</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Parolni o'zgartirish"}
            </Button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Boshqa raqam kiritish
            </button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Kirish sahifasiga qaytish
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
