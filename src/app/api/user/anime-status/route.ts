import { NextResponse } from "next/server";
import { db } from "../../../../server/db";
import { anime, animeImages, ratings, userAnimeStatus } from "../../../../server/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { withAuth } from "../../../../server/services/userService";

const ALLOWED = ["watching", "planned", "dropped", "completed"] as const;
type WatchStatus = (typeof ALLOWED)[number];

export const GET = withAuth(async (req, ctx) => {
  const userId = ctx.userId;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  if (status && !ALLOWED.includes(status as WatchStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const where = status
    ? and(eq(userAnimeStatus.userId, userId), eq(userAnimeStatus.status, status as WatchStatus))
    : eq(userAnimeStatus.userId, userId);

  const rows = await db
    .select({
      animeId: anime.id,
      status: userAnimeStatus.status,
      updatedAt: userAnimeStatus.updatedAt,
      title: anime.title,
      releaseYear: anime.releaseYear,
      description: anime.description,
      posterUrl: animeImages.imageUrl,
      userRating: ratings.value,
    })
    .from(userAnimeStatus)
    .innerJoin(anime, eq(userAnimeStatus.animeId, anime.id))
    .leftJoin(animeImages, and(eq(animeImages.animeId, anime.id), eq(animeImages.isPoster, true)))
    .leftJoin(ratings, and(eq(ratings.animeId, anime.id), eq(ratings.userId, userId)))
    .where(where)
    .orderBy(desc(userAnimeStatus.updatedAt));

  return NextResponse.json({ items: rows });
});

export const POST = withAuth(async (req, ctx) => {
  const userId = ctx.userId;

  const body = await req.json().catch(() => null);
  const animeId = Number(body?.animeId);
  const status = body?.status as WatchStatus | null | "none";

  if (!Number.isInteger(animeId)) {
    return NextResponse.json({ error: "Invalid animeId" }, { status: 400 });
  }

  if (status === null || status === "none") {
    await db
      .delete(userAnimeStatus)
      .where(and(eq(userAnimeStatus.userId, userId), eq(userAnimeStatus.animeId, animeId)));

    return NextResponse.json({ success: true });
  }

  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db
    .insert(userAnimeStatus)
    .values({
      userId,
      animeId,
      status,
      updatedAt: new Date(),
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userAnimeStatus.userId, userAnimeStatus.animeId],
      set: { status, updatedAt: new Date() },
    });

  return NextResponse.json({ success: true });
});
