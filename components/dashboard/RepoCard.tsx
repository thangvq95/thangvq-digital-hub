"use client";

import Image from "next/image";
import Link from "next/link";
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

  return (
    <article
      id={`repo-card-${repo.full_name.replace("/", "-")}`}
      onClick={handleCardClick}
      className="p-5 rounded-2xl glass card-hover group relative cursor-pointer"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* Unread indicator */}
      {!repo.is_read && !repo.has_new_release && (
        <span
          className="absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
          style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
          title="New repository"
        >
          NEW
        </span>
      )}

      {/* New release indicator */}
      {repo.has_new_release && (
        <span
          className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full animate-pulse-glow"
          style={{ background: "hsl(142, 71%, 45%)" }}
          title="New release available"
        />
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
        <div
          className="text-sm font-semibold leading-tight hover:underline line-clamp-2"
          style={{ color: "var(--text-primary)" }}
        >
          {repo.full_name}
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
                borderColor: "var(--border)" 
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
        {repo.stars_growth && (
          <span style={{ color: "hsl(142, 71%, 55%)" }}>↑ {repo.stars_growth}</span>
        )}
        {repo.language && <span>· {repo.language}</span>}
        {repo.latest_release_tag && (
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-card)" }}>
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
              : { background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
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
              : { background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
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
