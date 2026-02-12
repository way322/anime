"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type WatchStatus = "watching" | "planned" | "dropped" | "completed";

const LABELS: Record<WatchStatus, string> = {
  watching: "Смотрю",
  planned: "Отложено",
  dropped: "Брошено",
  completed: "Просмотрено",
};

export default function AnimeUserActions({
  animeId,
  initialStatus,
  initialRating,
}: {
  animeId: number;
  initialStatus: WatchStatus | null;
  initialRating: number | null;
}) {
  const { status: sessionStatus } = useSession();
  const router = useRouter();

  const [watchStatus, setWatchStatus] = useState<WatchStatus | "none">(initialStatus ?? "none");
  const [rating, setRating] = useState<number | "none">(initialRating ?? "none");
  const [saving, setSaving] = useState(false);

  if (sessionStatus !== "authenticated") return null;

  const saveStatus = async (next: WatchStatus | "none") => {
    setSaving(true);
    setWatchStatus(next);

    const res = await fetch("/api/user/anime-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, status: next }),
    });

    setSaving(false);

    if (res.status === 401) router.push("/auth/login");
    router.refresh();
  };

  const saveRating = async (next: number | "none") => {
    setSaving(true);
    setRating(next);

    if (next === "none") {
      setSaving(false);
      return;
    }

    const res = await fetch("/api/user/rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, value: next }),
    });

    setSaving(false);

    if (res.status === 401) router.push("/auth/login");
    router.refresh();
  };

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="text-sm text-gray-300 mb-2">Мой список</div>
        <select
          value={watchStatus}
          onChange={(e) => saveStatus(e.target.value as any)}
          disabled={saving}
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
        >
          <option value="none">Не в списке</option>
          {Object.entries(LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="text-sm text-gray-300 mb-2">Моя оценка (1–10)</div>
        <select
          value={rating}
          onChange={(e) => saveRating(e.target.value === "none" ? "none" : Number(e.target.value))}
          disabled={saving}
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
        >
          <option value="none">Нет оценки</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        {saving && <div className="text-xs text-gray-400 mt-2">Сохраняю…</div>}
      </div>
    </div>
  );
}
