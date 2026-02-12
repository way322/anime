import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "../../server/db";
import { anime, animeImages, ratings, userAnimeStatus } from "../../server/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import ProfileClient from "./ProfileClient";

const ALLOWED = ["watching", "planned", "dropped", "completed"] as const;
type WatchStatus = (typeof ALLOWED)[number];

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

  const tab = (ALLOWED.includes(sp.tab as WatchStatus) ? sp.tab : "watching") as WatchStatus;

  try {
    const countsRows = await db
      .select({
        status: userAnimeStatus.status,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(userAnimeStatus)
      .where(eq(userAnimeStatus.userId, userId))
      .groupBy(userAnimeStatus.status);

    const counts = countsRows.reduce((acc, r) => {
      acc[r.status as WatchStatus] = Number(r.count);
      return acc;
    }, {} as Partial<Record<WatchStatus, number>>);

    const items = await db
      .select({
        animeId: anime.id,
        status: userAnimeStatus.status,
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
      .where(and(eq(userAnimeStatus.userId, userId), eq(userAnimeStatus.status, tab)))
      .orderBy(desc(userAnimeStatus.updatedAt));

    return (
      <ProfileClient
        user={{ name: session.user.name, email: session.user.email }}
        counts={counts}
        initialTab={tab}
        initialItems={items}
      />
    );
  } catch (error) {
    console.error("Ошибка при получении данных для профиля:", error);
    throw new Error("Ошибка при загрузке данных профиля");
  }
}
