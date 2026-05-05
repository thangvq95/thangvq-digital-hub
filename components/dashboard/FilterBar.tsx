"use client";

import { useState } from "react";
import { DOMAINS } from "@/lib/constants";

type Period = "daily" | "weekly" | "monthly";

const PERIODS: { label: string; value: Period }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const FilterBar: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<Period>("daily");
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [showFavOnly, setShowFavOnly] = useState(false);

  // TODO: propagate filter state via URL params or context

  return (
    <div
      id="filter-bar"
      className="flex flex-wrap items-center gap-3 p-4 rounded-2xl glass"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* Period toggle */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: "var(--bg-primary)" }}
        role="group"
        aria-label="Select time period"
      >
        {PERIODS.map(({ label, value }) => (
          <button
            key={value}
            id={`filter-period-${value}`}
            onClick={() => setActivePeriod(value)}
            className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200"
            style={
              activePeriod === value
                ? { background: "var(--accent)", color: "#fff" }
                : { color: "var(--text-secondary)" }
            }
            aria-pressed={activePeriod === value}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Domain filter */}
      <select
        id="filter-domain-select"
        value={activeDomain ?? ""}
        onChange={(e) => setActiveDomain(e.target.value || null)}
        className="px-3 py-2 rounded-xl text-sm outline-none transition-all cursor-pointer"
        style={{
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
        aria-label="Filter by domain"
      >
        <option value="">All Domains</option>
        {DOMAINS.map((domain) => (
          <option key={domain} value={domain}>
            {domain}
          </option>
        ))}
      </select>

      {/* Favorites toggle */}
      <button
        id="filter-favorites-toggle"
        onClick={() => setShowFavOnly((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
        style={
          showFavOnly
            ? { background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--accent)" }
            : { background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
        }
        aria-pressed={showFavOnly}
        aria-label="Show favorites only"
      >
        <span aria-hidden="true">⭐</span>
        Favorites
      </button>
    </div>
  );
};

export default FilterBar;
