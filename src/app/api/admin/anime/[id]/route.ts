// src/app/api/admin/anime/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "../../../../../server/db";
import {
  anime,
  animeGenres,
  animeImages,
  favorites,
  ratings,
  userAnimeStatus,
} from "../../../../../server/db/schema";
import { and, eq } from "drizzle-orm";
import { withRole } from "../../../../../server/services/userService";

// ✅ В Next 16 params = Promise
type RouteCtx = { params: Promise<{ id: string }> };

type PatchBody = {
  title?: string;
  description?: string | null;
  releaseYear?: number | null;
  status?: string | null;
  rating?: number | null;
  externalUrl?: string;
  posterUrl?: string | null;
};

export const PATCH = withRole<RouteCtx>("admin", async (req, _ctx, routeCtx) => {
  const params = routeCtx ? await Promise.resolve((routeCtx as any).params) : null;

  const animeId = Number.parseInt(params?.id ?? "", 10);

  if (!Number.isSafeInteger(animeId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json()) as PatchBody;

  const nextTitle = body.title != null ? body.title.trim() : undefined;
  const nextExternalUrl = body.externalUrl != null ? body.externalUrl.trim() : undefined;

  if (nextTitle !== undefined && !nextTitle) {
    return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
  }
  if (nextExternalUrl !== undefined && !nextExternalUrl) {
    return NextResponse.json({ error: "externalUrl cannot be empty" }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(anime)
      .set({
        ...(nextTitle !== undefined ? { title: nextTitle } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.releaseYear !== undefined ? { releaseYear: body.releaseYear } : {}),
        ...(body.status !== undefined ? { status: (body.status ?? "ongoing") as any } : {}),
        ...(body.rating !== undefined ? { rating: body.rating ?? 0 } : {}),
        ...(nextExternalUrl !== undefined ? { externalUrl: nextExternalUrl } : {}),
      })
      .where(eq(anime.id, animeId));

    if (body.posterUrl !== undefined) {
      const posterUrl = (body.posterUrl ?? "").trim();

      if (!posterUrl) {
        await tx
          .delete(animeImages)
          .where(and(eq(animeImages.animeId, animeId), eq(animeImages.isPoster, true)));
      } else {
        const existing = await tx.query.animeImages.findFirst({
          where: and(eq(animeImages.animeId, animeId), eq(animeImages.isPoster, true)),
        });

        if (existing) {
          await tx
            .update(animeImages)
            .set({ imageUrl: posterUrl })
            .where(eq(animeImages.id, existing.id));
        } else {
          await tx.insert(animeImages).values({
            animeId,
            imageUrl: posterUrl,
            isPoster: true,
          });
        }
      }
    }
  });

  return NextResponse.json({ ok: true });
});

export const DELETE = withRole<RouteCtx>("admin", async (_req, _ctx, routeCtx) => {
  const params = routeCtx ? await routeCtx.params : null; // ✅ await
  const animeId = Number.parseInt(params?.id ?? "", 10);

  if (!Number.isSafeInteger(animeId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    await tx.delete(ratings).where(eq(ratings.animeId, animeId));
    await tx.delete(favorites).where(eq(favorites.animeId, animeId));
    await tx.delete(userAnimeStatus).where(eq(userAnimeStatus.animeId, animeId));
    await tx.delete(animeGenres).where(eq(animeGenres.animeId, animeId));
    await tx.delete(animeImages).where(eq(animeImages.animeId, animeId));
    await tx.delete(anime).where(eq(anime.id, animeId));
  });

  return NextResponse.json({ ok: true });
});
