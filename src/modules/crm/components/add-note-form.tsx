"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addCustomerNote } from "@/modules/crm/actions";

export function AddNoteForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [note, setNote] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await addCustomerNote(customerId, note);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setNote("");
    toast.success("Izoh qo'shildi");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mijoz haqida izoh..." rows={3} />
      <Button type="submit" size="sm" disabled={pending} className="w-fit gap-1.5">
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        Izoh qo&apos;shish
      </Button>
    </form>
  );
}
