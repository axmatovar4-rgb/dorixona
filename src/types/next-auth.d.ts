import { Role } from "@prisma/client";
import { DefaultSession } from "@auth/core/types";

export type AccountType = "STAFF" | "CUSTOMER";

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      type: AccountType;
      role?: Role;
    } & DefaultSession["user"];
  }

  interface User {
    type: AccountType;
    role?: Role;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    type: AccountType;
    role?: Role;
  }
}
