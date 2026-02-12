// src/app/admin/AdminClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type AdminAnimeItem = {
  id: number;
  title: string;
  description: string | null;
  releaseYear: number | null;
  status: string | null;
  // ✅ теперь это средняя оценка (avg из ratings)
  rating: number | null;
  externalUrl: string;
  posterUrl: string | null;
};

type FormState = {
  title: string;
  description: string;
  releaseYear: string;
  status: string;
  externalUrl: string;
  posterUrl: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  releaseYear: "",
  status: "ongoing",
  externalUrl: "",
  posterUrl: "",
};

export default function AdminClient() {
  const [items, setItems] = useState<AdminAnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => x.title.toLowerCase().includes(q));
  }, [items, query]);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/anime", { cache: "no-store" });
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (item: AdminAnimeItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title ?? "",
      description: item.description ?? "",
      releaseYear: item.releaseYear != null ? String(item.releaseYear) : "",
      status: item.status ?? "ongoing",
      externalUrl: item.externalUrl ?? "",
      posterUrl: item.posterUrl ?? "",
    });
  };

  const submit = async () => {
    const body = {
      title: form.title.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      releaseYear: form.releaseYear.trim() ? Number(form.releaseYear) : null,
      status: form.status.trim() || "ongoing",
      externalUrl: form.externalUrl.trim(),
      posterUrl: form.posterUrl.trim() ? form.posterUrl.trim() : null,
    };

    if (!body.title) return alert("Введите title");
    if (!body.externalUrl) return alert("Введите externalUrl (iframe url)");

    setSaving(true);

    const res = await fetch(editingId ? `/api/admin/anime/${editingId}` : "/api/admin/anime", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Ошибка сохранения");
      return;
    }

    await load();
    startCreate();
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить тайтл? Будут удалены рейтинги/статусы/изображения.")) return;

    const res = await fetch(`/api/admin/anime/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Ошибка удаления");
      return;
    }
    await load();
    if (editingId === id) startCreate();
  };

  const formatRating = (v: number | null | undefined) => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n.toFixed(1) : "0.0";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Админ-панель</h1>
            <p className="text-gray-300">Создание, редактирование и удаление тайтлов</p>
          </div>

          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию..."
              className="w-full md:w-72 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-400/60"
            />
            <button
              onClick={startCreate}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15"
            >
              + Новый
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FORM */}
          <div className="lg:col-span-1 bg-white/7 border border-white/12 rounded-3xl p-5">
            <div className="text-white font-semibold text-lg mb-3">
              {editingId ? `Редактирование #${editingId}` : "Новый тайтл"}
            </div>

            <div className="space-y-3">
              <Field label="Название">
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                />
              </Field>

              <Field label="Описание">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={5}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none resize-none"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Год">
                  <input
                    value={form.releaseYear}
                    onChange={(e) => setForm((p) => ({ ...p, releaseYear: e.target.value }))}
                    inputMode="numeric"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                  />
                </Field>

                <Field label="Статус">
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                  >
                    <option value="ongoing">ongoing</option>
                    <option value="completed">completed</option>
                    <option value="hiatus">hiatus</option>
                  </select>
                </Field>
              </div>

              {/* ✅ Рейтинг убрали из формы: он считается по users ratings */}

              <Field label="externalUrl (iframe)">
                <input
                  value={form.externalUrl}
                  onChange={(e) => setForm((p) => ({ ...p, externalUrl: e.target.value }))}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                />
              </Field>

              <Field label="posterUrl (опционально)">
                <input
                  value={form.posterUrl}
                  onChange={(e) => setForm((p) => ({ ...p, posterUrl: e.target.value }))}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                />
                <div className="text-xs text-gray-400 mt-2">
                  Оставь пустым, чтобы удалить/не задавать постер.
                </div>
              </Field>

              <button
                onClick={submit}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold hover:from-purple-700 hover:to-violet-700 disabled:opacity-60"
              >
                {saving ? "Сохраняю..." : editingId ? "Сохранить изменения" : "Создать"}
              </button>
            </div>
          </div>

          {/* LIST */}
          <div className="lg:col-span-2">
            <div className="bg-white/7 border border-white/12 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-semibold text-lg">Тайтлы</div>
                <div className="text-gray-400 text-sm">
                  {loading ? "Загрузка..." : `Всего: ${items.length}`}
                </div>
              </div>

              {loading ? (
                <div className="text-gray-300">Загрузка…</div>
              ) : filtered.length === 0 ? (
                <div className="text-gray-300">Ничего не найдено.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                    >
                      <div className="relative w-full h-40 bg-black/25">
                        {a.posterUrl ? (
                          <Image src={a.posterUrl} alt={a.title} fill className="object-cover" />
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="text-white font-semibold line-clamp-1">{a.title}</div>

                        {/* ✅ Тут показываем средний рейтинг */}
                        <div className="text-gray-400 text-sm">
                          {a.releaseYear ?? "—"} • {a.status ?? "—"} • {formatRating(a.rating)}
                        </div>

                        <div className="text-gray-300 text-sm mt-2 line-clamp-2">
                          {a.description ?? "Описание отсутствует"}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <button
                            onClick={() => startEdit(a)}
                            className="py-2 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15"
                          >
                            Изменить
                          </button>
                          <button
                            onClick={() => remove(a.id)}
                            className="py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-400">
              Подсказка: если постеры с внешних доменов — добавь домен в{" "}
              <code>next.config.ts</code> (images.domains).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm text-gray-300 mb-1">{label}</div>
      {children}
    </div>
  );
}
