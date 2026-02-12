import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../app/api/auth/[...nextauth]/route";

export const ROLES = ["user", "admin"] as const;
export type UserRole = (typeof ROLES)[number];

export type RequestContext = {
  session: Session | null;
  userId: number | null;
  role: UserRole | null;
};

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** ✅ (3) Создаём контекст запроса: session + userId + role */
export async function createRequestContext(): Promise<RequestContext> {
  const session = await getServerSession(authOptions);

  const rawId = session?.user?.id;
  const userId = rawId ? Number.parseInt(String(rawId), 10) : null;
  const safeUserId = Number.isSafeInteger(userId) ? userId : null;

  const rawRole = (session?.user as any)?.role as UserRole | undefined;
  const role = rawRole && ROLES.includes(rawRole) ? rawRole : null;

  return { session, userId: safeUserId, role };
}

/** ✅ (4a) Макрос проверки авторизации */
export function requireAuth(ctx: RequestContext): RequestContext & {
  session: Session;
  userId: number;
  role: UserRole;
} {
  if (!ctx.session?.user?.id || ctx.userId == null) {
    throw new HttpError(401, "Unauthorized");
  }
  // если роль почему-то не пришла — считаем user
  return { ...ctx, role: (ctx.role ?? "user") as UserRole, session: ctx.session, userId: ctx.userId };
}

/** ✅ (4b) Макрос проверки роли */
export function requireRole(
  ctx: RequestContext,
  roles: UserRole | UserRole[]
) {
  const authed = requireAuth(ctx);
  const list = Array.isArray(roles) ? roles : [roles];

  if (!list.includes(authed.role)) {
    throw new HttpError(403, "Forbidden");
  }

  return authed;
}

/** Утилита: превращаем HttpError в JSON-ответ */
export function httpErrorToResponse(err: unknown) {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  throw err;
}

/** ✅ “Макрос”-обёртка: добавляет ctx в обработчик */
export function withContext(
  handler: (req: Request, ctx: RequestContext) => Promise<Response>
) {
  return async (req: Request) => {
    const ctx = await createRequestContext();
    try {
      return await handler(req, ctx);
    } catch (err) {
      return httpErrorToResponse(err);
    }
  };
}

/** ✅ “Макрос”-обёртка: требует авторизацию */
export function withAuth(
  handler: (req: Request, ctx: ReturnType<typeof requireAuth>) => Promise<Response>
) {
  return withContext(async (req, ctx) => handler(req, requireAuth(ctx)));
}

/** ✅ “Макрос”-обёртка: требует роль */
export function withRole(
  roles: UserRole | UserRole[],
  handler: (req: Request, ctx: ReturnType<typeof requireRole>) => Promise<Response>
) {
  return withContext(async (req, ctx) => handler(req, requireRole(ctx, roles)));
}
