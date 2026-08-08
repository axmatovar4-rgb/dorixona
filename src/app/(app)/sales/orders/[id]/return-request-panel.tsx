"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { resolveReturnRequest } from "@/modules/orders/actions";

export function ReturnRequestPanel({
  orderId,
  returnStatus,
  returnReason,
  returnNote,
  canEdit,
}: {
  orderId: string;
  returnStatus: "PENDING" | "APPROVED" | "REJECTED";
  returnReason: string | null;
  returnNote: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = React.useState("");
  const [pending, setPending] = React.useState<"approve" | "reject" | null>(null);

  async function handleResolve(approve: boolean) {
    setPending(approve ? "approve" : "reject");
    const result = await resolveReturnRequest(orderId, approve, note);
    setPending(null);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(approve ? "Tasdiqlandi, buyurtma bekor qilindi" : "Rad etildi");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge variant={returnStatus === "APPROVED" ? "secondary" : returnStatus === "REJECTED" ? "destructive" : "outline"}>
          {returnStatus === "PENDING" ? "Ko'rib chiqilmoqda" : returnStatus === "APPROVED" ? "Tasdiqlangan" : "Rad etilgan"}
        </Badge>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">Mijoz sababi</span>
        <p className="text-sm font-medium">&quot;{returnReason}&quot;</p>
      </div>
      {returnStatus === "PENDING" && canEdit ? (
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Javob izohi (ixtiyoriy)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="max-w-md"
          />
          <div className="flex gap-2">
            <Button size="sm" disabled={!!pending} onClick={() => handleResolve(true)} className="gap-1.5">
              {pending === "approve" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Tasdiqlash (bekor qilish)
            </Button>
            <Button size="sm" variant="outline" disabled={!!pending} onClick={() => handleResolve(false)} className="gap-1.5">
              {pending === "reject" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Rad etish
            </Button>
          </div>
        </div>
      ) : (
        returnNote && (
          <div>
            <span className="text-sm text-muted-foreground">Javob</span>
            <p className="text-sm font-medium">{returnNote}</p>
          </div>
        )
      )}
    </div>
  );
}
