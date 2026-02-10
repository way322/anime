// src/app/catalog/page.tsx
import Link from "next/link";
import Image from "next/image";
import { db } from "../../server/db";
import { anime, animeImages } from "../../server/db/schema";
import { eq } from "drizzle-orm";

export default async function CatalogPage() {
  const items = await db.query.anime.findMany();

  // для простоты получаем постер для каждого аниме (можно оптимизировать join'ом)
  const itemsWithPoster = await Promise.all(
    items.map(async (a) => {
      const poster = await db.query.animeImages.findFirst({
        where: eq(animeImages.animeId, a.id),
      });
      return { ...a, poster };
    })
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Каталог аниме</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {itemsWithPoster.map((a) => (
            <Link
              key={a.id}
              href={`/anime/${a.id}`}
              className="group block bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-purple-500/30 transition"
            >
              <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 bg-black/20">
                {a.poster?.imageUrl ? (
                  <Image
                    src={a.poster.imageUrl}
                    alt={a.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">{a.title}</h3>
              <p className="text-sm text-gray-300 line-clamp-3">
                {a.description ?? "Описание отсутствует"}
              </p>

              <div className="mt-4 text-sm text-gray-400">
                <span>{a.releaseYear ? a.releaseYear : "—"}</span>
                <span className="mx-2">•</span>
                <span>{a.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
