"use client";

import * as React from "react";
import { toast } from "sonner";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateTelegramLinkToken, unlinkTelegram } from "@/modules/customer/actions";
import { useRouter } from "next/navigation";

export function TelegramLinkCard({ linked }: { linked: boolean }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleLink() {
    setPending(true);
    const result = await generateTelegramLinkToken();
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  async function handleUnlink() {
    setPending(true);
    await unlinkTelegram();
    setPending(false);
    toast.success("Telegram uzildi");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border bg-card p-6 portal-shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
          <Send className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">Telegram bildirishnomalari</h2>
          <p className="text-sm text-muted-foreground">
            {linked
              ? "Ulangan — dori tugashi va mavjudlik xabarlari Telegram'ga ham boradi"
              : "Dori tugashi va mavjudlik haqida Telegram orqali bepul xabar oling"}
          </p>
        </div>
      </div>
      <div className="mt-4">
        {linked ? (
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={handleUnlink}
            className="gap-1.5 rounded-full"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Uzish
          </Button>
        ) : (
          <Button size="sm" disabled={pending} onClick={handleLink} className="gap-1.5 rounded-full">
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Telegram&apos;ni ulash
          </Button>
        )}
      </div>
    </div>
  );
}
