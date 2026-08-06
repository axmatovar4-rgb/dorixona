"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAppSettings } from "@/modules/settings/actions";

type Settings = { companyName: string; supportPhone: string | null; supportEmail: string | null; currencySymbol: string };

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [form, setForm] = React.useState({
    companyName: settings.companyName,
    supportPhone: settings.supportPhone ?? "",
    supportEmail: settings.supportEmail ?? "",
    currencySymbol: settings.currencySymbol,
  });
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await updateAppSettings(form);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Sozlamalar saqlandi");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-1.5">
        <Label>Kompaniya nomi</Label>
        <Input value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Qo&apos;llab-quvvatlash telefoni</Label>
        <Input value={form.supportPhone} onChange={(e) => setForm((f) => ({ ...f, supportPhone: e.target.value }))} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Qo&apos;llab-quvvatlash email</Label>
        <Input value={form.supportEmail} onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Valyuta belgisi</Label>
        <Input value={form.currencySymbol} onChange={(e) => setForm((f) => ({ ...f, currencySymbol: e.target.value }))} className="w-32" />
      </div>
      <Button type="submit" disabled={pending} className="w-fit gap-1.5">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Saqlash
      </Button>
    </form>
  );
}
