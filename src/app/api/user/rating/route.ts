import { NextResponse } from "next/server";
import { db } from "../../../../server/db";
import { ratings } from "../../../../server/db/schema";
import { and, eq } from "drizzle-orm";
import { withAuth } from "../../../../server/services/userService";

export const GET = withAuth(async (req, ctx) => {
  const userId = ctx.userId;

  const { searchParams } = new URL(req.url);
  const animeId = Number(searchParams.get("animeId"));

  if (!Number.isInteger(animeId)) {
    return NextResponse.json({ error: "Invalid animeId" }, { status: 400 });
  }

  const row = await db.query.ratings.findFirst({
    where: and(eq(ratings.userId, userId), eq(ratings.animeId, animeId)),
  });

  return NextResponse.json({ value: row?.value ?? null });
});

export const POST = withAuth(async (req, ctx) => {
  const userId = ctx.userId;

  const body = await req.json().catch(() => null);
  const animeId = Number(body?.animeId);

  // value может быть числом или null (для удаления)
  const rawValue = body?.value;
  const value = rawValue === null || rawValue === undefined ? null : Number(rawValue);

  if (!Number.isInteger(animeId)) {
    return NextResponse.json({ error: "Invalid animeId" }, { status: 400 });
  }

  // Удаление оценки
  if (value === null) {
    await db
      .delete(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.animeId, animeId)));

    return NextResponse.json({ success: true });
  }

  // Теперь 0..10
  if (!Number.isInteger(value) || value < 0 || value > 10) {
    return NextResponse.json({ error: "Rating must be 0..10" }, { status: 400 });
  }

  const existing = await db.query.ratings.findFirst({
    where: and(eq(ratings.userId, userId), eq(ratings.animeId, animeId)),
  });

  if (existing) {
    await db.update(ratings).set({ value }).where(eq(ratings.id, existing.id));
  } else {
    await db.insert(ratings).values({ userId, animeId, value });
  }

  return NextResponse.json({ success: true });
});
