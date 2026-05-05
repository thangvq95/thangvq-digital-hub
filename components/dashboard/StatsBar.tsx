// Server Component — fetches stats from Supabase at request time
const StatsBar: React.FC = async () => {
  // TODO: fetch from Supabase
  const stats = {
    total: 0,
    favorites: 0,
    applied: 0,
    lastSync: null as string | null,
  };

  return (
    <div
      id="stats-bar"
      className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl text-sm"
      style={{ color: "var(--text-muted)" }}
    >
      <span>
        <strong style={{ color: "var(--text-secondary)" }}>{stats.total}</strong> repos
      </span>
      <span className="w-px h-4" style={{ background: "var(--border)" }} aria-hidden="true" />
      <span>
        <strong style={{ color: "var(--text-secondary)" }}>{stats.favorites}</strong> favorites
      </span>
      <span className="w-px h-4" style={{ background: "var(--border)" }} aria-hidden="true" />
      <span>
        <strong style={{ color: "var(--text-secondary)" }}>{stats.applied}</strong> applied
      </span>
      {stats.lastSync && (
        <>
          <span className="w-px h-4" style={{ background: "var(--border)" }} aria-hidden="true" />
          <span>Last sync: {stats.lastSync}</span>
        </>
      )}
    </div>
  );
};

export default StatsBar;
