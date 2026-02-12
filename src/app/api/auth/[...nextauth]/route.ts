import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import YandexProvider from "next-auth/providers/yandex";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { db } from "../../../../server/db";
import { users } from "../../../../server/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/login",
    signOut: "/",
    error: "/auth/error",
    newUser: "/auth/register",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        // ✅ (1) возвращаем role для типизации и консистентности
        return {
          id: String(user.id),
          email: user.email,
          name: user.username,
          role: (user.role as any) ?? "user",
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID!,
      clientSecret: process.env.YANDEX_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // создаём пользователя в БД при OAuth, если его нет
      if (account?.provider !== "credentials") {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!existingUser) {
          // ✅ (2) при OAuth можно явно указать role (хотя default = "user")
          await db.insert(users).values({
            email: user.email,
            username: user.name ?? "fox",
            provider: account?.provider || "oauth",
            providerId: account?.providerAccountId,
            role: "user",
          });
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // при первом логине (и credentials, и oauth) у нас есть user/account
      if (account && user?.email) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (dbUser) {
          token.id = String(dbUser.id);
          token.sub = String(dbUser.id);
          token.email = dbUser.email;
          token.name = dbUser.username;

          // ✅ (3) добавляем роль в токен
          token.role = (dbUser.role as any) ?? "user";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = (token.name as string) ?? session.user.name;

        // ✅ (4) добавляем роль в session.user
        session.user.role = (token.role as any) ?? "user";
      }

      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
