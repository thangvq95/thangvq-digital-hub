"use client";

import { useEffect, useRef } from "react";
import { ExternalLink, X, Layers } from "lucide-react";
import { buildStackUrl } from "@/lib/utils";

interface ProjectDialogProps {
  project: {
    title: string;
    description: string;
    tags: string[];
    url?: string;
    stackProject?: string | null;
    image?: string;
  };
  onClose: () => void;
}

export default function ProjectDialog({
  project,
  onClose,
}: ProjectDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const stackUrl = buildStackUrl(project.stackProject);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6 animate-dialog-in"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors duration-150 cursor-pointer"
          style={{ color: "var(--text-secondary)" }}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h3
          className="text-xl font-bold mb-2 pr-8"
          style={{ color: "var(--text-primary)" }}
        >
          {project.title}
        </h3>

        {/* Description */}
        <p
          className="text-sm mb-5 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: "var(--accent-glow)",
                color: "var(--accent)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Project Screenshot */}
        {project.image && (
          <div
            className="mb-5 overflow-hidden rounded-xl border"
            style={{ borderColor: "var(--border)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image}
              alt={`${project.title} screenshot`}
              className="w-full h-auto block"
              loading="lazy"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{
                background: "var(--accent-glow)",
                border: "1px solid var(--accent)",
                color: "var(--accent)",
              }}
            >
              <ExternalLink size={15} />
              Visit Website
            </a>
          )}

          {stackUrl && (
            <a
              href={stackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{
                background: "var(--bg-elevated, var(--bg-card))",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <Layers size={15} />
              How to build this project
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
