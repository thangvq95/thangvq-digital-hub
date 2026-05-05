"use client";

import Image from "next/image";
import { useState } from "react";
import type { Repository } from "@/lib/api/types";

interface RepoCardProps {
  repo: Repository;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo }) => {
  const [isFavorite, setIsFavorite] = useState(repo.is_favorite);
  const [isApplied, setIsApplied] = useState(repo.is_applied);

  // TODO: implement optimistic PATCH calls to /api/repos/[fullName]
  const handleToggleFavorite = () => setIsFavorite((v) => !v);
  const handleToggleApplied = () => setIsApplied((v) => !v);

  const rank = repo.rank_daily ?? repo.rank_weekly ?? repo.rank_monthly;

  return (
    <article
      id={`repo-card-${repo.full_name.replace("/", "-")}`}
      className="p-5 rounded-2xl glass card-hover group relative"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* Rank badge */}
      {rank && (
        <span
          className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          #{rank}
        </span>
      )}

      {/* Avatar + title */}
      <div className="flex items-start gap-3 mb-3">
        {repo.avatar_url ? (
          <Image
            src={repo.avatar_url}
            alt={`${repo.full_name} owner avatar`}
            width={32}
            height={32}
            className="rounded-full flex-shrink-0"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ background: "var(--bg-card)" }}
          />
        )}
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold leading-tight hover:underline line-clamp-2"
          style={{ color: "var(--text-primary)" }}
          aria-label={`Open ${repo.full_name} on GitHub`}
        >
          {repo.full_name}
        </a>
      </div>

      {/* Description */}
      <p
        className="text-xs line-clamp-2 mb-3"
        style={{ color: "var(--text-secondary)" }}
      >
        {repo.description ?? "No description available."}
      </p>

      {/* Stars + Language */}
      <div
        className="flex items-center gap-3 text-xs mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        <span aria-label={`${repo.stars_total?.toLocaleString()} stars`}>
          ⭐ {repo.stars_total?.toLocaleString() ?? "—"}
        </span>
        {repo.stars_growth && (
          <span style={{ color: "hsl(142, 71%, 55%)" }}>↑ {repo.stars_growth}</span>
        )}
        {repo.language && <span>· {repo.language}</span>}
      </div>

      {/* Domain tags */}
      {repo.domains && repo.domains.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {repo.domains.slice(0, 3).map((domain) => (
            <span
              key={domain}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "var(--accent-glow)",
                color: "var(--accent)",
              }}
            >
              {domain}
            </span>
          ))}
          {repo.domains.length > 3 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ color: "var(--text-muted)" }}
            >
              +{repo.domains.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          id={`repo-${repo.full_name.replace("/", "-")}-favorite`}
          onClick={handleToggleFavorite}
          className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200"
          style={
            isFavorite
              ? { background: "var(--accent)", color: "#fff" }
              : { background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
          }
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
        >
          {isFavorite ? "♥ Saved" : "♡ Save"}
        </button>
        <button
          id={`repo-${repo.full_name.replace("/", "-")}-applied`}
          onClick={handleToggleApplied}
          className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200"
          style={
            isApplied
              ? { background: "hsl(142, 71%, 45%)", color: "#fff" }
              : { background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
          }
          aria-label={isApplied ? "Mark as not applied" : "Mark as applied"}
          aria-pressed={isApplied}
        >
          {isApplied ? "✓ Applied" : "✓ Apply"}
        </button>
      </div>
    </article>
  );
};

export default RepoCard;
