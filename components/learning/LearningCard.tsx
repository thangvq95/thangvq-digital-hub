"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Check, ExternalLink, Globe, Image as ImageIcon, FileText, Calendar } from "lucide-react";
import { patchLearning } from "@/lib/api/learning-client";
import type { Learning } from "@/lib/api/learning-types";

const LinkedinIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface LearningCardProps {
  learning: Learning;
  onUpdate?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

export const LearningCard: React.FC<LearningCardProps> = ({ learning, onUpdate }) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState<boolean>(learning.is_favorite);
  const [isLearned, setIsLearned] = useState<boolean>(learning.is_learned);
  const [imgError, setImgError] = useState<boolean>(false);

  const handleCardClick = () => {
    router.push(`/learning/${learning.id}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetVal = !isFavorite;
    setIsFavorite(targetVal);
    try {
      await patchLearning(learning.id, { is_favorite: targetVal });
      onUpdate?.();
    } catch (err) {
      console.error(err);
      setIsFavorite(!targetVal);
    }
  };

  const handleToggleLearned = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetVal = !isLearned;
    setIsLearned(targetVal);
    try {
      await patchLearning(learning.id, { is_learned: targetVal });
      onUpdate?.();
    } catch (err) {
      console.error(err);
      setIsLearned(!targetVal);
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "linkedin":
        return <LinkedinIcon size={12} className="text-[#0A66C2]" />;
      case "medium":
        return <Globe size={12} className="text-white" />;
      case "official_blog":
        return <Globe size={12} className="text-indigo-400" />;
      case "image":
        return <ImageIcon size={12} className="text-pink-400" />;
      default:
        return <FileText size={12} className="text-neutral-400" />;
    }
  };

  const getSourceLabel = (sourceType: string) => {
    switch (sourceType) {
      case "linkedin":
        return "LinkedIn";
      case "medium":
        return "Medium";
      case "official_blog":
        return "Official Blog";
      case "image":
        return "Screenshot";
      default:
        return "Manual";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const topicColor = learning.topic.color || "#6366f1";
  const imageUrl = learning.image_path ? `${API_URL}/uploads/${learning.image_path}` : null;

  return (
    <article
      id={`learning-card-${learning.id}`}
      onClick={handleCardClick}
      className="rounded-2xl glass card-hover flex flex-col overflow-hidden relative cursor-pointer group"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* Thumbnail or Topic Accent Bar */}
      {imageUrl && !imgError ? (
        <div className="relative w-full aspect-video border-b overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <Image
            src={imageUrl}
            alt={learning.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
          {/* Analyze status badge */}
          {learning.analyze_status === "analyzing" && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse uppercase tracking-wider">
              AI Analyzing
            </div>
          )}
        </div>
      ) : (
        <div 
          className="h-3 w-full flex-shrink-0"
          style={{ background: `linear-gradient(90deg, ${topicColor}, ${topicColor}88)` }}
        />
      )}

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Badges row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Left: Topic + Subtopic badges */}
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{
                background: `${topicColor}15`,
                color: topicColor,
                border: `1px solid ${topicColor}30`,
              }}
            >
              {learning.topic.display_name}
            </span>

            {learning.subtopic && (
              <span
                className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                {learning.subtopic.display_name}
              </span>
            )}
          </div>

          {/* Right: Source Indicator */}
          <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
            {getSourceIcon(learning.source_type)}
            <span>{getSourceLabel(learning.source_type)}</span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-sm font-semibold mb-2 group-hover:underline line-clamp-2"
          style={{ color: "var(--text-primary)" }}
        >
          {learning.title}
        </h3>

        {/* Summary Snippet */}
        <p
          className="text-xs line-clamp-3 mb-4 flex-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {learning.summary 
            ? learning.summary.replace(/[#*`\n]/g, " ").replace(/\s+/g, " ").trim()
            : "Waiting for AI summary analysis..."}
        </p>

        {/* Metadata + Actions row */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5 text-[11px]">
          {/* Date */}
          <div className="flex items-center gap-1 text-neutral-500 font-mono">
            <Calendar size={11} />
            <span>{formatDate(learning.created_at)}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Source Link */}
            {learning.source_url && (
              <a
                href={learning.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Open Source Link"
                aria-label="Open Source Link"
              >
                <ExternalLink size={12} />
              </a>
            )}

            {/* Favorite toggle */}
            <button
              onClick={handleToggleFavorite}
              className="p-1.5 rounded-lg transition-colors cursor-pointer"
              style={
                isFavorite
                  ? { color: "#ec4899", background: "rgba(236, 72, 153, 0.1)" }
                  : { color: "var(--text-muted)" }
              }
              title={isFavorite ? "Remove from favorites" : "Favorite"}
              aria-pressed={isFavorite}
            >
              <Heart size={12} fill={isFavorite ? "currentColor" : "none"} />
            </button>

            {/* Learned toggle */}
            <button
              onClick={handleToggleLearned}
              className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 border"
              style={
                isLearned
                  ? { background: "rgba(16, 185, 129, 0.15)", borderColor: "#10B981", color: "#10B981" }
                  : { background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-muted)" }
              }
              title={isLearned ? "Mark unlearned" : "Mark learned"}
              aria-pressed={isLearned}
            >
              <Check size={10} strokeWidth={3} />
              <span>{isLearned ? "Learned" : "To Learn"}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
export default LearningCard;
