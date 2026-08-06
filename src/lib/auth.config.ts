import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.type = token.type;
      session.user.role = token.role;
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isPublicPortalPath =
        pathname === "/" || pathname === "/shop" || pathname.startsWith("/shop/");
      if (isPublicPortalPath) return true;
      return !!auth?.user;
    },
  },
};
