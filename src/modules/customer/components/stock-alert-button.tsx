"use client";

import * as React from "react";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subscribeToStockAlert } from "@/modules/customer/actions";

export function StockAlertButton({ productId }: { productId: string }) {
  const [pending, setPending] = React.useState(false);
  const [subscribed, setSubscribed] = React.useState(false);

  async function handleClick() {
    setPending(true);
    const result = await subscribeToStockAlert(productId);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setSubscribed(true);
    toast.success(
      result.alreadySubscribed
        ? "Siz allaqachon xabar olishga yozilgansiz"
        : "Mahsulot mavjud bo'lganda sizga xabar beramiz"
    );
  }

  return (
    <Button
      variant="outline"
      disabled={pending || subscribed}
      onClick={handleClick}
      className="w-full gap-1.5 rounded-full sm:w-auto"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : subscribed ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      {subscribed ? "Xabar olasiz" : "Menga xabar ber"}
    </Button>
  );
}
