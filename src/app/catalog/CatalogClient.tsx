// src/app/catalog/CatalogClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SortKey = "new" | "rating" | "year";
type StatusKey = "all" | "ongoing" | "completed" | "hiatus";
type RatingOrder = "desc" | "asc";

type CatalogItem = {
    id: number;
    title: string;
    description: string | null;
    releaseYear: number | null;
    status: string | null;
    posterUrl: string | null;
    rating: number;
    ratingsCount: number;
};

const STATUS_LABELS: Record<Exclude<StatusKey, "all">, string> = {
    ongoing: "В процессе",
    completed: "Завершено",
    hiatus: "Пауза",
};

function statusToRu(v: string | null | undefined) {
    if (!v) return "—";
    return (STATUS_LABELS as any)[v] ?? v;
}

function formatRating(v: number | null | undefined) {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n.toFixed(1) : "0.0";
}

function joinGenres(genres: string[]) {
    return genres.map((g) => g.trim()).filter(Boolean).join(",");
}

export default function CatalogClient(props: {
    initialFilters: {
        status: StatusKey;
        sort: SortKey;
        ratingOrder: RatingOrder;
        yearFrom: string;
        yearTo: string;
        genres: string[];
    };
    allGenres: string[];
    initialLimit: number;
}) {
    const router = useRouter();

    const [panelOpen, setPanelOpen] = useState(true);
    const [genresOpen, setGenresOpen] = useState(true);

    const [status, setStatus] = useState<StatusKey>(props.initialFilters.status ?? "all");
    const [sort, setSort] = useState<SortKey>(props.initialFilters.sort ?? "new");
    const [ratingOrder, setRatingOrder] = useState<RatingOrder>(
        props.initialFilters.ratingOrder ?? "desc"
    );
    const [yearFrom, setYearFrom] = useState(props.initialFilters.yearFrom ?? "");
    const [yearTo, setYearTo] = useState(props.initialFilters.yearTo ?? "");
    const [selectedGenres, setSelectedGenres] = useState<string[]>(props.initialFilters.genres ?? []);

    const [items, setItems] = useState<CatalogItem[]>([]);
    const [loadingFirst, setLoadingFirst] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [nextOffset, setNextOffset] = useState(0);

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const didMountRef = useRef(false);

    const filtersKey = useMemo(() => {
        return JSON.stringify({
            status,
            sort,
            ratingOrder: sort === "rating" ? ratingOrder : "desc",
            yearFrom: yearFrom.trim(),
            yearTo: yearTo.trim(),
            genres: [...selectedGenres].sort(),
        });
    }, [status, sort, ratingOrder, yearFrom, yearTo, selectedGenres]);

    const buildUrl = () => {
        const sp = new URLSearchParams();

        if (status !== "all") sp.set("status", status);
        if (sort !== "new") sp.set("sort", sort);
        if (sort === "rating") sp.set("ratingOrder", ratingOrder);

        const yf = yearFrom.trim();
        const yt = yearTo.trim();
        if (yf) sp.set("yearFrom", yf);
        if (yt) sp.set("yearTo", yt);

        if (selectedGenres.length) sp.set("genres", joinGenres(selectedGenres));

        const qs = sp.toString();
        return qs ? `/catalog?${qs}` : "/catalog";
    };

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            return;
        }
        const t = setTimeout(() => {
            router.push(buildUrl());
        }, 250);
        return () => clearTimeout(t);
    }, [filtersKey]);

    const fetchPage = async (offset: number) => {
        const sp = new URLSearchParams();
        sp.set("offset", String(offset));
        sp.set("limit", String(props.initialLimit));

        if (status !== "all") sp.set("status", status);
        sp.set("sort", sort);
        if (sort === "rating") sp.set("ratingOrder", ratingOrder);
        if (yearFrom.trim()) sp.set("yearFrom", yearFrom.trim());
        if (yearTo.trim()) sp.set("yearTo", yearTo.trim());
        if (selectedGenres.length) sp.set("genres", joinGenres(selectedGenres));

        const res = await fetch(`/api/catalog/anime?${sp.toString()}`, { cache: "no-store" });
        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`Catalog API error ${res.status}: ${txt}`);
        }

        const data = await res.json().catch(() => ({}));

        return {
            items: (Array.isArray(data.items) ? data.items : []) as CatalogItem[],
            hasMore: Boolean(data.hasMore),
            nextOffset: Number.isFinite(Number(data.nextOffset)) ? Number(data.nextOffset) : offset,
        };
    };

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoadingFirst(true);
                setHasMore(true);
                setNextOffset(0);

                const data = await fetchPage(0);
                if (cancelled) return;

                setItems(data.items);
                setHasMore(data.hasMore);
                setNextOffset(data.nextOffset);
            } finally {
                if (!cancelled) setLoadingFirst(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [filtersKey]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const obs = new IntersectionObserver(
            async (entries) => {
                const entry = entries[0];
                if (!entry?.isIntersecting) return;
                if (loadingFirst || loadingMore || !hasMore) return;

                setLoadingMore(true);
                try {
                    const data = await fetchPage(nextOffset);
                    setItems((prev) => [...prev, ...data.items]);
                    setHasMore(data.hasMore);
                    setNextOffset(data.nextOffset);
                } finally {
                    setLoadingMore(false);
                }
            },
            { root: null, rootMargin: "400px", threshold: 0.01 }
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, [hasMore, loadingFirst, loadingMore, nextOffset, filtersKey]);

    const reset = () => {
        setStatus("all");
        setSort("new");
        setRatingOrder("desc");
        setYearFrom("");
        setYearTo("");
        setSelectedGenres([]);
        router.push("/catalog");
    };

    const toggleGenre = (name: string) => {
        setSelectedGenres((prev) => {
            const exists = prev.includes(name);
            return exists ? prev.filter((x) => x !== name) : [...prev, name];
        });
    };

    const gridClass =
        "grid grid-cols-1 gap-6 " + (panelOpen ? "md:grid-cols-[280px_1fr]" : "md:grid-cols-1");

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 px-4 pt-28 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between gap-3 mb-6">
                    <h1 className="text-4xl font-bold text-white">Каталог аниме</h1>
                </div>

                <div className={gridClass}>
                    <aside className={`${panelOpen ? "block" : "hidden"} bg-white/5 border border-white/10 rounded-2xl`}>
                        <div className="sticky top-24">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <div className="text-white font-semibold">Фильтры</div>
                                <button
                                    type="button"
                                    onClick={() => setPanelOpen(false)}
                                    className="text-gray-300 hover:text-white"
                                    title="Скрыть"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-auto">
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">Статус</div>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as StatusKey)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                    >
                                        <option value="all">Все</option>
                                        <option value="ongoing">В процессе</option>
                                        <option value="completed">Завершено</option>
                                        <option value="hiatus">Пауза</option>
                                    </select>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-400 mb-1">Сортировка</div>
                                    <select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value as SortKey)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                    >
                                        <option value="new">Новые</option>
                                        <option value="rating">По рейтингу</option>
                                        <option value="year">По году</option>
                                    </select>

                                    {sort === "rating" && (
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setRatingOrder("desc")}
                                                className={`py-2 rounded-xl border ${ratingOrder === "desc"
                                                        ? "bg-white/15 border-white/30 text-white"
                                                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                                                    }`}
                                            >
                                                Убыв.
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRatingOrder("asc")}
                                                className={`py-2 rounded-xl border ${ratingOrder === "asc"
                                                        ? "bg-white/15 border-white/30 text-white"
                                                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                                                    }`}
                                            >
                                                Возр.
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-xs text-gray-400 mb-1">Год от</div>
                                        <input
                                            value={yearFrom}
                                            onChange={(e) => setYearFrom(e.target.value)}
                                            inputMode="numeric"
                                            placeholder="2010"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 mb-1">Год до</div>
                                        <input
                                            value={yearTo}
                                            onChange={(e) => setYearTo(e.target.value)}
                                            inputMode="numeric"
                                            placeholder="2025"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setGenresOpen((p) => !p)}
                                        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-left"
                                    >
                                        <div className="text-sm text-gray-200">
                                            Жанры{" "}
                                            {selectedGenres.length > 0 && (
                                                <span className="text-gray-400">({selectedGenres.length})</span>
                                            )}
                                        </div>
                                        <span className="text-gray-300">{genresOpen ? "▾" : "▸"}</span>
                                    </button>

                                    {genresOpen && (
                                        <div className="mt-2 bg-black/15 border border-white/10 rounded-xl p-3 max-h-64 overflow-auto space-y-2">
                                            {props.allGenres.length === 0 ? (
                                                <div className="text-sm text-gray-400">Жанров пока нет.</div>
                                            ) : (
                                                props.allGenres.map((g) => {
                                                    const checked = selectedGenres.includes(g);
                                                    return (
                                                        <label key={g} className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggleGenre(g)}
                                                                className="accent-purple-500"
                                                            />
                                                            <span className="truncate">{g}</span>
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={reset}
                                    className="w-full py-3 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15"
                                >
                                    Сбросить
                                </button>
                            </div>
                        </div>
                    </aside>

                    <section>
                        {!panelOpen && (
                            <div className="mb-4">
                                <button
                                    type="button"
                                    onClick={() => setPanelOpen(true)}
                                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15"
                                >
                                    Открыть фильтры
                                </button>
                            </div>
                        )}

                        {loadingFirst ? (
                            <div className="text-gray-300 bg-white/5 border border-white/10 rounded-2xl p-6">
                                Загрузка…
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-gray-300 bg-white/5 border border-white/10 rounded-2xl p-6">
                                Ничего не найдено.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {items.map((a) => (
                                        <Link
                                            key={a.id}
                                            href={`/anime/${a.id}`}
                                            className="group block bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-purple-500/30 transition"
                                        >
                                            <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 bg-black/20">
                                                {a.posterUrl ? (
                                                    <Image src={a.posterUrl} alt={a.title} fill className="object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{a.title}</h3>
                                            <p className="text-sm text-gray-300 line-clamp-3">
                                                {a.description ?? "Описание отсутствует"}
                                            </p>

                                            <div className="mt-4 text-sm text-gray-400 flex flex-wrap gap-x-2 gap-y-1">
                                                <span>{a.releaseYear ?? "—"}</span>
                                                <span>•</span>
                                                <span>{statusToRu(a.status)}</span>
                                                <span>•</span>
                                                <span>
                                                    {formatRating(a.rating)}{" "}
                                                    <span className="text-gray-500">({a.ratingsCount})</span>
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                <div ref={sentinelRef} className="h-10" />

                                {loadingMore && <div className="mt-4 text-gray-300">Подгружаю ещё…</div>}
                                {!hasMore && <div className="mt-6 text-sm text-gray-400">Больше ничего нет.</div>}
                            </>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}