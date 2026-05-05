import Link from "next/link";

const DashboardHeader: React.FC = () => {
  return (
    <header
      id="dashboard-header"
      className="sticky top-0 z-50 glass border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" id="dashboard-home-link" className="flex items-center gap-2 group">
            <span
              className="text-xl font-bold tracking-tight group-hover:opacity-80 transition-opacity"
              style={{ color: "var(--text-primary)" }}
            >
              Tech<span className="gradient-text">Trend</span>
            </span>
          </Link>
          <span
            className="hidden sm:inline text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "var(--accent-glow)",
              color: "var(--accent)",
              border: "1px solid var(--accent-glow-strong)",
            }}
          >
            Live
          </span>
        </div>

        {/* Search input — TODO: wire up with SearchBar client component */}
        <div className="flex-1 max-w-sm">
          <input
            id="dashboard-search-input"
            type="search"
            placeholder="Search repositories..."
            className="w-full px-4 py-2 rounded-full text-sm outline-none transition-all"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            disabled
            aria-label="Search repositories (coming soon)"
          />
        </div>

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            id="dashboard-portfolio-link"
            className="text-sm transition-colors hover:underline"
            style={{ color: "var(--text-secondary)" }}
          >
            Portfolio
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default DashboardHeader;
