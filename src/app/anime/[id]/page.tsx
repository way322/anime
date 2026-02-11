import { notFound } from "next/navigation";
import { db } from "../../../server/db";
import { anime, ratings, userAnimeStatus } from "../../../server/db/schema";
import { and, eq } from "drizzle-orm";
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

  // ✅ если пользователь залогинен — достанем его статус и оценку
  const session = await getServerSession(authOptions);
  let initialStatus: any = null;
  let initialRating: number | null = null;

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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white/5 p-6 rounded-3xl border border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
            <Image src="/fox.png" alt="logo" width={32} height={32} />
          </div>
          <div>
            <h1 className="text-2xl text-white font-bold">{item.title}</h1>
            <p className="text-sm text-gray-300">{item.releaseYear ?? ""}</p>
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

        {/* ✅ списки и оценка (только для авторизованных) */}
        <AnimeUserActions
          animeId={animeId}
          initialStatus={initialStatus}
          initialRating={initialRating}
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
