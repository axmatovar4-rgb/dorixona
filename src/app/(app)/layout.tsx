import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { ROLE_LABELS } from "@/lib/role-labels";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.type !== "STAFF" || !session.user.role) redirect("/account");

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar className="hidden lg:flex" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          userName={session.user.name ?? session.user.email ?? "Foydalanuvchi"}
          roleLabel={ROLE_LABELS[session.user.role]}
        />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
