export default function TechTrendLoading() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <div className="h-16 glass border-b border-[var(--border)] animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Filter bar skeleton */}
        <div className="h-12 rounded-xl bg-[var(--bg-card)] animate-pulse" />

        {/* Stats bar skeleton */}
        <div className="h-10 rounded-lg bg-[var(--bg-card)] animate-pulse" />

        {/* Repo grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-2xl bg-[var(--bg-card)] animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
