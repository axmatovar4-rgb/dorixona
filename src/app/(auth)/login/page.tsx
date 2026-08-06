import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthBackground } from "@/components/auth-background";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Tizimga kirish" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.type === "CUSTOMER" ? "/account" : "/dashboard");
  }

  return (
    <AuthBackground>
      <LoginForm />
    </AuthBackground>
  );
}
