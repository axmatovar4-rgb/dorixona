"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { requestOrderCancellation } from "@/modules/customer/actions";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function handleSubmit() {
    setPending(true);
    const result = await requestOrderCancellation(orderId, reason);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("So'rovingiz yuborildi");
    setOpen(false);
    setReason("");
    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="gap-1.5 rounded-full" onClick={() => setOpen(true)}>
        <Undo2 className="h-3.5 w-3.5" />
        Bekor qilish / Qaytarish so&apos;rovi
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        placeholder="Sababini yozing (masalan: fikrimdan qaytdim, noto'g'ri dori keldi va h.k.)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        className="rounded-xl"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setOpen(false)}>
          Bekor qilish
        </Button>
        <Button size="sm" className="gap-1.5 rounded-full" disabled={pending || reason.trim().length < 3} onClick={handleSubmit}>
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          So&apos;rovni yuborish
        </Button>
      </div>
    </div>
  );
}
