// src/app/api/admin/anime/route.ts
import { NextResponse } from "next/server";
import { db } from "../../../../server/db";
import { anime, animeImages, ratings } from "../../../../server/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { withRole } from "../../../../server/services/userService";

type Body = {
  title?: string;
  description?: string | null;
  releaseYear?: number | null;
  status?: string | null;
  externalUrl?: string;
  posterUrl?: string | null; // можно null / "" чтобы без постера
};

export const GET = withRole("admin", async () => {
  const items = await db
    .select({
      id: anime.id,
      title: anime.title,
      description: anime.description,
      releaseYear: anime.releaseYear,
      status: anime.status,

      // ✅ Средняя оценка из таблицы ratings (0 если нет оценок)
      rating: sql<number>`coalesce(avg(${ratings.value}), 0)::float`.as("rating"),

      externalUrl: anime.externalUrl,
      posterUrl: animeImages.imageUrl,
    })
    .from(anime)
    .leftJoin(ratings, eq(ratings.animeId, anime.id))
    .leftJoin(
      animeImages,
      and(eq(animeImages.animeId, anime.id), eq(animeImages.isPoster, true))
    )
    .groupBy(anime.id, animeImages.imageUrl)
    .orderBy(desc(anime.createdAt));

  return NextResponse.json({ items });
});

export const POST = withRole("admin", async (req) => {
  const body = (await req.json()) as Body;

  const title = (body.title ?? "").trim();
  const externalUrl = (body.externalUrl ?? "").trim();

  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!externalUrl) return NextResponse.json({ error: "externalUrl is required" }, { status: 400 });

  const created = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(anime)
      .values({
        title,
        description: body.description ?? null,
        releaseYear: body.releaseYear ?? null,
        status: (body.status ?? "ongoing") as any,
        // ✅ rating НЕ записываем, он считается из ratings
        externalUrl,
      })
      .returning({ id: anime.id });

    const posterUrl = (body.posterUrl ?? "").trim();
    if (posterUrl) {
      await tx.insert(animeImages).values({
        animeId: row.id,
        imageUrl: posterUrl,
        isPoster: true,
      });
    }

    return row;
  });

  return NextResponse.json({ ok: true, id: created.id });
});
