import type { Metadata } from "next";
import { AuthBackground } from "@/components/auth-background";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Parolni tiklash" };

export default function ForgotPasswordPage() {
  return (
    <AuthBackground>
      <ForgotPasswordForm />
    </AuthBackground>
  );
}
