"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DOMAINS } from "@/lib/constants";

const PERIODS = ["daily", "weekly", "monthly"] as const;

const FilterBar: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") ?? "daily";
  const currentDomain = searchParams.get("domain") ?? "";
  const currentFav = searchParams.get("fav") === "true";

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/tech?${params.toString()}`);
  };

  return (
    <div
      id="filter-bar"
      className="flex flex-wrap items-center gap-3 p-4 rounded-2xl glass"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* Period tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ background: "var(--bg-primary)" }}
        role="group"
        aria-label="Select time period"
      >
        {PERIODS.map((p) => (
          <button
            key={p}
            id={`filter-period-${p}`}
            onClick={() => setFilter("period", p)}
            className="px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer"
            style={
              currentPeriod === p
                ? { background: "var(--accent)", color: "#fff" }
                : { color: "var(--text-muted)" }
            }
            aria-pressed={currentPeriod === p}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Domain dropdown */}
      <select
        id="filter-domain"
        value={currentDomain}
        onChange={(e) => setFilter("domain", e.target.value)}
        className="px-3 py-1.5 text-xs rounded-lg cursor-pointer outline-none"
        style={{
          background: "var(--bg-card)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border)",
        }}
        aria-label="Filter by domain"
      >
        <option value="">All Domains</option>
        {DOMAINS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Favorites toggle */}
      <button
        id="filter-fav"
        onClick={() => setFilter("fav", currentFav ? "" : "true")}
        className="px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer"
        style={
          currentFav
            ? { background: "var(--accent)", color: "#fff" }
            : { background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
        }
        aria-pressed={currentFav}
        aria-label="Show favorites only"
      >
        {currentFav ? "♥ Favorites" : "♡ Favorites"}
      </button>
    </div>
  );
};

export default FilterBar;
