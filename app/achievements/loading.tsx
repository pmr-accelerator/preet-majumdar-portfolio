export default function AchievementsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="animate-pulse">
        {/* Page heading */}
        <div className="mb-10">
          <div className="h-3 w-24 rounded bg-white/10 mb-5" />
          <div className="h-9 w-72 max-w-full rounded bg-white/10 mb-4" />
          <div className="h-4 w-full max-w-2xl rounded bg-white/10" />
          <div className="h-4 w-2/3 max-w-xl rounded bg-white/10 mt-2" />
        </div>

        {/* Achievement cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="aspect-video w-full rounded-lg bg-white/10 mb-4" />
              <div className="h-3 w-28 rounded bg-white/10 mb-3" />
              <div className="h-5 w-4/5 rounded bg-white/10 mb-3" />
              <div className="h-3 w-full rounded bg-white/10 mb-2" />
              <div className="h-3 w-5/6 rounded bg-white/10 mb-4" />
              <div className="h-3 w-36 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}