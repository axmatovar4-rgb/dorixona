import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PortalHeader } from "@/components/portal-header";
import { PortalFooter } from "@/components/portal-footer";
import { CartProvider } from "@/modules/customer/cart-context";
import { AIChatProvider } from "@/modules/customer/ai-chat-context";
import { AIChatSheet } from "@/modules/customer/components/ai-chat-sheet";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user && session.user.type !== "CUSTOMER") redirect("/dashboard");
  const customerName = session?.user?.type === "CUSTOMER" ? (session.user.name ?? "Mijoz") : null;

  return (
    <CartProvider>
      <AIChatProvider>
        <div className="portal-theme flex min-h-screen flex-col bg-background text-foreground">
          <PortalHeader customerName={customerName} />
          <main className="flex-1">{children}</main>
          <PortalFooter />
        </div>
        <AIChatSheet />
      </AIChatProvider>
    </CartProvider>
  );
}
