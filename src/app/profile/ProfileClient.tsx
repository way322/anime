"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type WatchStatus = "watching" | "planned" | "dropped" | "completed";

const TABS: { key: WatchStatus; label: string }[] = [
  { key: "watching", label: "Смотрю" },
  { key: "planned", label: "Отложено" },
  { key: "dropped", label: "Брошено" },
  { key: "completed", label: "Просмотрено" },
];

type Item = {
  animeId: number;
  status: string;
  title: string;
  releaseYear: number | null;
  description: string | null;
  posterUrl: string | null;
  userRating: number | null;
};

export default function ProfileClient({
  user,
  counts,
  initialTab,
  initialItems,
}: {
  user: { name?: string | null; email?: string | null };
  counts: Partial<Record<WatchStatus, number>>;
  initialTab: WatchStatus;
  initialItems: Item[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<WatchStatus>(initialTab);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [loading, setLoading] = useState(false);

  const tabCounts = useMemo(() => {
    const base: Record<WatchStatus, number> = {
      watching: 0,
      planned: 0,
      dropped: 0,
      completed: 0,
    };
    for (const k of Object.keys(base) as WatchStatus[]) {
      base[k] = counts[k] ?? 0;
    }
    return base;
  }, [counts]);

  const loadTab = async (next: WatchStatus) => {
    setTab(next);
    setLoading(true);

    const res = await fetch(`/api/user/anime-status?status=${next}`);
    if (res.status === 401) {
      router.push("/auth/login");
      return;
    }

    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  };

  const updateStatus = async (animeId: number, nextStatus: WatchStatus | "none") => {
    const res = await fetch("/api/user/anime-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, status: nextStatus }),
    });

    if (res.status === 401) {
      router.push("/auth/login");
      return;
    }

    if (nextStatus === "none" || nextStatus !== tab) {
      setItems((prev) => prev.filter((x) => x.animeId !== animeId));
    } else {
      setItems((prev) =>
        prev.map((x) => (x.animeId === animeId ? { ...x, status: nextStatus } : x))
      );
    }
  };

  const updateRating = async (animeId: number, value: number | "none") => {
    const res = await fetch("/api/user/rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, value: value === "none" ? null : value }),
    });

    if (res.status === 401) {
      router.push("/auth/login");
      return;
    }

    setItems((prev) =>
      prev.map((x) =>
        x.animeId === animeId ? { ...x, userRating: value === "none" ? null : value } : x
      )
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center shadow-lg">
                <Image src="/fox.png" alt="Avatar" width={44} height={44} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{user.name ?? "Пользователь"}</div>
                <div className="text-gray-300">{user.email ?? ""}</div>
              </div>
            </div>

            <Link
              href="/api/auth/signout?callbackUrl=/"
              className="w-full md:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold text-center hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/25"
            >
              Выйти
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => loadTab(t.key)}
                className={`px-4 py-2 rounded-xl border transition-all ${tab === t.key
                    ? "bg-white/15 border-white/30 text-white"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
              >
                {t.label} <span className="text-gray-400">({tabCounts[t.key]})</span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="text-gray-300">Загрузка…</div>
            ) : items.length === 0 ? (
              <div className="text-gray-300 bg-white/5 border border-white/10 rounded-2xl p-6">
                В этом списке пока пусто.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((a) => (
                  <div
                    key={a.animeId}
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                  >
                    <Link href={`/anime/${a.animeId}`} className="block group">
                      <div className="relative w-full h-44 bg-black/20">
                        {a.posterUrl ? (
                          <Image
                            src={a.posterUrl}
                            alt={a.title}
                            fill
                            className="object-cover group-hover:scale-[1.02] transition-transform"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="text-white font-semibold text-lg line-clamp-1">{a.title}</div>
                        <div className="text-gray-400 text-sm">{a.releaseYear ?? "—"}</div>
                        <div className="text-gray-300 text-sm mt-2 line-clamp-2">
                          {a.description ?? "Описание отсутствует"}
                        </div>
                      </div>
                    </Link>

                    <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                      <select
                        defaultValue={tab as any}
                        onChange={(e) => updateStatus(a.animeId, e.target.value as any)}
                        className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                      >
                        <option value="none">Не в списке</option>
                        <option value="watching">Смотрю</option>
                        <option value="planned">Отложено</option>
                        <option value="dropped">Брошено</option>
                        <option value="completed">Просмотрено</option>
                      </select>

                      <select
                        defaultValue={a.userRating ?? "none"}
                        onChange={(e) =>
                          updateRating(
                            a.animeId,
                            e.target.value === "none" ? "none" : Number(e.target.value)
                          )
                        }
                        className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                      >
                        <option value="none">Оценка</option>
                        {Array.from({ length: 11 }, (_, i) => i).map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <Link href="/catalog" className="text-gray-400 hover:text-white">
              ← В каталог
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
