"use client";

import Image from "next/image";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api/client";
import type { Repository } from "@/lib/api/types";

interface RepoCardProps {
  repo: Repository;
  onUpdate?: () => void;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo, onUpdate }) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(repo.is_favorite);
  const [isArchived, setIsArchived] = useState(repo.is_archived);

  const handleCardClick = () => {
    router.push(`/tech/${repo.full_name}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite((v) => !v);
    try {
      await api.repos.patch(repo.full_name, { is_favorite: !isFavorite });
    } catch {
      setIsFavorite((v) => !v);
    }
  };

  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsArchived((v) => !v);
    try {
      await api.repos.patch(repo.full_name, { is_archived: !isArchived });
      onUpdate?.();
    } catch {
      setIsArchived((v) => !v);
    }
  };

  const isScrapedToday = () => {
    if (!repo.last_scraped_at) return false;
    // Compare in UTC to avoid timezone mismatch (DB stores timestamptz as UTC)
    const scrapedUtc = new Date(repo.last_scraped_at)
      .toISOString()
      .slice(0, 10);
    const todayUtc = new Date().toISOString().slice(0, 10);
    return scrapedUtc === todayUtc;
  };

  const [imageError, setImageError] = useState(false);
  const isValidAvatar =
    repo.avatar_url &&
    repo.avatar_url.startsWith("http") &&
    !repo.avatar_url.includes("[object Object]");

  return (
    <article
      id={`repo-card-${repo.full_name.replace("/", "-")}`}
      onClick={handleCardClick}
      className="p-5 rounded-2xl glass card-hover group relative cursor-pointer"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* Header: Avatar + Title + Badges + GitHub icon */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        {isValidAvatar && !imageError ? (
          <Image
            src={repo.avatar_url!}
            alt={`${repo.full_name} owner avatar`}
            width={32}
            height={32}
            className="rounded-full flex-shrink-0 mt-0.5"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            {repo.full_name.substring(0, 2).toUpperCase()}
          </div>
        )}

        {/* Title + badges row */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            {/* Title */}
            <div
              className="text-sm font-semibold leading-tight hover:underline line-clamp-2 flex-1 min-w-0"
              style={{ color: "var(--text-primary)" }}
            >
              {repo.full_name}
            </div>

            {/* Right-side badges + icon — flex, no absolute */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Unread indicator */}
              {!repo.is_read && !repo.has_new_release && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm"
                  style={{
                    background: "var(--accent-glow)",
                    color: "var(--accent)",
                  }}
                  title="New repository"
                >
                  NEW
                </span>
              )}

              {/* Rank badge */}
              {isScrapedToday() && repo.trending_rank && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm border"
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "rgb(16, 185, 129)",
                    borderColor: "rgba(16, 185, 129, 0.2)",
                  }}
                  title={`Weekly Trending Rank #${repo.trending_rank}`}
                >
                  #{repo.trending_rank}
                </span>
              )}

              {/* New release dot */}
              {repo.has_new_release && (
                <span
                  className="w-2 h-2 rounded-full animate-pulse-glow flex-shrink-0"
                  style={{ background: "hsl(142, 71%, 45%)" }}
                  title="New release available"
                />
              )}

              {/* GitHub icon */}
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all duration-200 flex-shrink-0 cursor-pointer"
                title="Open on GitHub"
                aria-label="Open on GitHub"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-xs line-clamp-2 mb-3"
        style={{ color: "var(--text-secondary)" }}
      >
        {repo.description ?? "No description available."}
      </p>

      {/* Tags */}
      {repo.tags && repo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {repo.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                borderColor: "var(--border)",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div
        className="flex items-center gap-3 text-xs mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        <span aria-label={`${repo.stars_total?.toLocaleString()} stars`}>
          ⭐ {repo.stars_total?.toLocaleString() ?? "—"}
        </span>
        {isScrapedToday() && repo.stars_growth && (
          <span style={{ color: "hsl(142, 71%, 55%)" }}>
            ↑ {repo.stars_growth.replace(/.*?\/svg>\s*/, '')}
          </span>
        )}
        {repo.language && <span>· {repo.language}</span>}
        {repo.latest_release_tag && (
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: "var(--bg-card)" }}
          >
            {repo.latest_release_tag}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          id={`repo-${repo.full_name.replace("/", "-")}-favorite`}
          onClick={handleToggleFavorite}
          className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer"
          style={
            isFavorite
              ? { background: "var(--accent)", color: "#fff" }
              : {
                  background: "var(--bg-card)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }
          }
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
        >
          {isFavorite ? "♥ Saved" : "♡ Save"}
        </button>
        <button
          id={`repo-${repo.full_name.replace("/", "-")}-archive`}
          onClick={handleToggleArchive}
          className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer"
          style={
            isArchived
              ? { background: "hsl(220, 15%, 25%)", color: "var(--text-muted)" }
              : {
                  background: "var(--bg-card)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }
          }
          aria-label={isArchived ? "Unarchive" : "Archive"}
          aria-pressed={isArchived}
        >
          {isArchived ? "📦 Archived" : "📦 Archive"}
        </button>
      </div>
    </article>
  );
};

export default RepoCard;
