import { notFound } from "next/navigation";
import { db } from "../../../server/db";
import { anime, favorites, ratings, userAnimeStatus } from "../../../server/db/schema";
import { and, asc, eq, sql } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import AnimeUserActions from "../../components/AnimeUserActions";
import { NextResponse } from "next/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnimePlayerPage({ params }: PageProps) {
  const { id } = await params;
  const animeId = Number.parseInt(id, 10);

  if (Number.isNaN(animeId)) notFound();

  const item = await db.query.anime.findFirst({
    where: eq(anime.id, animeId),
  });

  if (!item) notFound();

  const [agg] = await db
    .select({
      avgRating: sql<number>`coalesce(avg(${ratings.value}), 0)`.as("avgRating"),
      ratingsCount: sql<number>`count(${ratings.id})`.as("ratingsCount"),
    })
    .from(ratings)
    .where(eq(ratings.animeId, animeId));

  const avgRating = Number(agg?.avgRating ?? 0);
  const ratingsCount = Number(agg?.ratingsCount ?? 0);

  const distRows = await db
    .select({
      value: ratings.value,
      count: sql<number>`count(*)::int`.as("count"),
    })
    .from(ratings)
    .where(eq(ratings.animeId, animeId))
    .groupBy(ratings.value)
    .orderBy(asc(ratings.value));

  const ratingDist = Array.from({ length: 11 }, () => 0);
  for (const r of distRows) {
    const v = Number(r.value);
    const c = Number(r.count);
    if (Number.isInteger(v) && v >= 1 && v <= 10) ratingDist[v] = c;
  }
  const maxDist = Math.max(0, ...ratingDist.slice(1));

  const session = await getServerSession(authOptions);
  let initialStatus: any = null;
  let initialRating: number | null = null;
  let initialLoved = false;

  if (session?.user?.id) {
    const userId = Number.parseInt(session.user.id, 10);
    if (!Number.isSafeInteger(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const st = await db.query.userAnimeStatus.findFirst({
      where: and(eq(userAnimeStatus.userId, userId), eq(userAnimeStatus.animeId, animeId)),
    });
    initialStatus = st?.status ?? null;

    const rt = await db.query.ratings.findFirst({
      where: and(eq(ratings.userId, userId), eq(ratings.animeId, animeId)),
    });
    initialRating = rt?.value ?? null;

    const fv = await db.query.favorites.findFirst({
      where: and(eq(favorites.userId, userId), eq(favorites.animeId, animeId)),
    });
    initialLoved = Boolean(fv);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white/5 p-6 rounded-3xl border border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
            <Image src="/fox.png" alt="logo" width={32} height={32} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl text-white font-bold truncate">{item.title}</h1>
            <p className="text-sm text-gray-300">
              {item.releaseYear ?? "—"} • Средняя оценка: {avgRating.toFixed(1)} • Оценило: {ratingsCount}
            </p>
          </div>
        </div>

        <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10">
          <iframe
            src={item.externalUrl}
            title={item.title}
            width="100%"
            height="100%"
            style={{ border: "0" }}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            allowFullScreen
          />
        </div>

        <div className="mt-6 text-gray-300">
          <p>{item.description ?? "Описание отсутствует."}</p>
        </div>

        <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-white font-semibold">Рейтинг (1–10)</div>
            <div className="text-sm text-gray-300">
              Средняя: <span className="text-white font-semibold">{avgRating.toFixed(1)}</span>{" "}
              <span className="text-gray-500">•</span>{" "}
              Оценок: <span className="text-white font-semibold">{ratingsCount}</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {Array.from({ length: 10 }, (_, i) => 10 - i).map((value) => {
              const count = ratingDist[value] ?? 0;
              const pct = maxDist > 0 ? Math.round((count / maxDist) * 100) : 0;

              return (
                <div key={value} className="flex items-center gap-3">
                  <div className="w-8 text-xs text-gray-300">{value}</div>

                  <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-violet-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="w-10 text-right text-xs text-gray-400">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <AnimeUserActions
          animeId={animeId}
          initialStatus={initialStatus}
          initialRating={initialRating}
          initialLoved={initialLoved}
        />

        <div className="mt-6">
          <Link href="/catalog" className="text-sm text-gray-400 hover:text-white">
            ← Вернуться в каталог
          </Link>
        </div>
      </div>
    </div>
  );
}