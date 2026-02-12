// types/next-auth.d.ts
import type { DefaultSession } from "next-auth";

export type UserRole = "user" | "admin";

declare module "next-auth" {
  /**
   * Расширяем DefaultSession: добавляем id и role в session.user
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  /**
   * Расширяем User (что возвращает authorize / приходит в callbacks)
   */
  interface User {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  /**
   * Расширяем JWT payload, чтобы token.id / token.role были известны TS
   */
  interface JWT {
    id?: string;
    role?: UserRole;
    email?: string | null;
    name?: string | null;
  }
}

export {};
