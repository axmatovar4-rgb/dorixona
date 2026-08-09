import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PosTerminal } from "./pos-terminal";

export const metadata: Metadata = { title: "Kassa (POS)" };

export default async function PosPage() {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "sales", "create")) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kassa (POS)</h1>
        <p className="text-sm text-muted-foreground">
          Do&apos;konda xarid qiluvchi mijozlar uchun tezkor sotuv — shtrix-kodni kamerada skanerlang yoki qo&apos;lda kiriting
        </p>
      </div>
      <PosTerminal />
    </div>
  );
}
