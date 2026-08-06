"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, auth } from "@/lib/auth";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", {
      identifier: formData.get("identifier"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Ma'lumotlar noto'g'ri";
        default:
          return "Kirishda xatolik yuz berdi";
      }
    }
    throw error;
  }

  const session = await auth();
  redirect(session?.user.type === "CUSTOMER" ? "/account" : "/dashboard");
}
