// src/app/catalog/loading.tsx
export default function LoadingCatalog() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070d]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.20),transparent_30%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.14),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-[0.12]" />
        <div className="absolute -top-24 left-[8%] h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute top-32 right-[6%] h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
      </div>

      <div className="relative z-10 px-4 pt-28 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[28px] border border-white/12 bg-white/[0.06] p-6 text-gray-300 shadow-xl backdrop-blur-xl">
            Загрузка каталога…
          </div>
        </div>
      </div>
    </div>
  );
}