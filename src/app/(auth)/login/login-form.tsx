"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticate } from "./actions";

export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <Card className="portal-shadow-lg w-full max-w-sm border-primary/10 backdrop-blur-sm">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-xl">Tizimga kirish</CardTitle>
        <CardDescription>Davom etish uchun ma&apos;lumotlaringizni kiriting</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="identifier">Email yoki telefon raqam</Label>
            <Input
              id="identifier"
              name="identifier"
              placeholder="admin@pharmcare.uz yoki +998901234567"
              required
              autoComplete="username"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Parol</Label>
              <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Parolni unutdingizmi?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Kirish"
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Mijozmisiz?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
