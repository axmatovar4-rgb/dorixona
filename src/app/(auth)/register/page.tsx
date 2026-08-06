import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthBackground } from "@/components/auth-background";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.type === "CUSTOMER" ? "/account" : "/dashboard");
  }

  return (
    <AuthBackground>
      <RegisterForm />
    </AuthBackground>
  );
}
