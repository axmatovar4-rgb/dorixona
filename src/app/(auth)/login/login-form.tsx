"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Pill } from "lucide-react";
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
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Pill className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">PharmCare ERP</CardTitle>
        <CardDescription>Tizimga kirish uchun ma&apos;lumotlaringizni kiriting</CardDescription>
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
            <Label htmlFor="password">Parol</Label>
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
