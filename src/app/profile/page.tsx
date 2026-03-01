import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "../../server/db";
import { anime, animeImages, favorites, ratings, userAnimeStatus } from "../../server/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import ProfileClient from "./ProfileClient";

const ALLOWED = ["watching", "planned", "dropped", "completed", "loved"] as const;
type TabKey = (typeof ALLOWED)[number];

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProfilePage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const userId = Number.parseInt(session.user.id, 10);
  if (!Number.isSafeInteger(userId)) {
    console.error("Invalid user ID", session.user.id);
    redirect("/auth/login");
  }

  const sp = await searchParams;
  const tab = (ALLOWED.includes(sp.tab as any) ? (sp.tab as TabKey) : "watching") as TabKey;

  const countsRows = await db
    .select({
      status: userAnimeStatus.status,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(userAnimeStatus)
    .where(eq(userAnimeStatus.userId, userId))
    .groupBy(userAnimeStatus.status);

  const counts = countsRows.reduce((acc, r) => {
    acc[r.status as any] = Number(r.count);
    return acc;
  }, {} as Record<string, number>);

  const [lovedCountRow] = await db
    .select({ count: sql<number>`count(*)::int`.as("count") })
    .from(favorites)
    .where(eq(favorites.userId, userId));

  counts["loved"] = Number(lovedCountRow?.count ?? 0);

  let items: any[] = [];

  if (tab === "loved") {
    items = await db
      .select({
        animeId: anime.id,
        title: anime.title,
        releaseYear: anime.releaseYear,
        description: anime.description,
        posterUrl: animeImages.imageUrl,
        status: userAnimeStatus.status,
        userRating: ratings.value,
        loved: sql<boolean>`true`.as("loved"),
      })
      .from(favorites)
      .innerJoin(anime, eq(favorites.animeId, anime.id))
      .leftJoin(animeImages, and(eq(animeImages.animeId, anime.id), eq(animeImages.isPoster, true)))
      .leftJoin(userAnimeStatus, and(eq(userAnimeStatus.animeId, anime.id), eq(userAnimeStatus.userId, userId)))
      .leftJoin(ratings, and(eq(ratings.animeId, anime.id), eq(ratings.userId, userId)))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  } else {
    items = await db
      .select({
        animeId: anime.id,
        status: userAnimeStatus.status,
        title: anime.title,
        releaseYear: anime.releaseYear,
        description: anime.description,
        posterUrl: animeImages.imageUrl,
        userRating: ratings.value,
        loved: favorites.userId,
      })
      .from(userAnimeStatus)
      .innerJoin(anime, eq(userAnimeStatus.animeId, anime.id))
      .leftJoin(animeImages, and(eq(animeImages.animeId, anime.id), eq(animeImages.isPoster, true)))
      .leftJoin(ratings, and(eq(ratings.animeId, anime.id), eq(ratings.userId, userId)))
      .leftJoin(favorites, and(eq(favorites.animeId, anime.id), eq(favorites.userId, userId)))
      .where(and(eq(userAnimeStatus.userId, userId), eq(userAnimeStatus.status, tab)))
      .orderBy(desc(userAnimeStatus.updatedAt));

    items = items.map((r) => ({ ...r, loved: Boolean(r.loved) }));
  }

  return (
    <ProfileClient
      user={{ name: session.user.name, email: session.user.email }}
      counts={counts}
      initialTab={tab}
      initialItems={items}
    />
  );
}