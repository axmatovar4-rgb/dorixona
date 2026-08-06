import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email yoki telefon raqam" },
        password: { label: "Parol", type: "password" },
      },
      authorize: async (credentials) => {
        const identifier = credentials?.identifier as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!identifier || !password) return null;

        if (identifier.includes("@")) {
          const user = await prisma.user.findUnique({ where: { email: identifier } });
          if (!user || !user.isActive) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            type: "STAFF" as const,
            role: user.role,
          };
        }

        const customer = await prisma.customer.findUnique({ where: { phone: identifier } });
        if (!customer || !customer.isActive) return null;

        const valid = await bcrypt.compare(password, customer.passwordHash);
        if (!valid) return null;

        return {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          type: "CUSTOMER" as const,
        };
      },
    }),
  ],
});
