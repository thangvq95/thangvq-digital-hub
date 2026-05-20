"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ExternalLink,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { buildStackUrl } from "@/lib/utils";

interface ProjectDialogProps {
  project: {
    title: string;
    description: string;
    tags: string[];
    url?: string;
    stackProject?: string | null;
    images?: string[];
  };
  onClose: () => void;
}

export default function ProjectDialog({
  project,
  onClose,
}: ProjectDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const stackUrl = buildStackUrl(project.stackProject);
  const images = project.images ?? [];
  const hasImages = images.length > 0;
  const isCarousel = images.length > 1;
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  // Close on Escape, arrow-key navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (isCarousel && e.key === "ArrowLeft") prev();
      if (isCarousel && e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, isCarousel, prev, next]);

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

        {/* Image Carousel */}
        {hasImages && (
          <div className="mb-5">
            {/* Main image — clickable to open URL */}
            <a
              href={project.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative overflow-hidden rounded-xl border group bg-black/20 flex justify-center items-center"
              style={{ borderColor: "var(--border)" }}
              aria-label={`Open ${project.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={activeIndex}
                src={images[activeIndex]}
                alt={`${project.title} screenshot ${activeIndex + 1}`}
                className="max-h-[380px] w-auto block object-contain transition-opacity duration-200"
                loading="lazy"
              />
              {/* Subtle hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center bg-black/40">
                <ExternalLink size={22} color="#fff" />
              </div>
            </a>

            {/* Carousel controls */}
            {isCarousel && (
              <div className="flex items-center justify-between mt-3 px-1">
                {/* Prev */}
                <button
                  onClick={prev}
                  className="p-1.5 rounded-lg transition-colors duration-150 cursor-pointer"
                  style={{
                    background: "var(--accent-glow)",
                    color: "var(--accent)",
                  }}
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Dots */}
                <div className="flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className="rounded-full transition-all duration-200 cursor-pointer"
                      style={{
                        width: i === activeIndex ? "18px" : "6px",
                        height: "6px",
                        background:
                          i === activeIndex ? "var(--accent)" : "var(--border)",
                      }}
                      aria-label={`Go to screenshot ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Next */}
                <button
                  onClick={next}
                  className="p-1.5 rounded-lg transition-colors duration-150 cursor-pointer"
                  style={{
                    background: "var(--accent-glow)",
                    color: "var(--accent)",
                  }}
                  aria-label="Next screenshot"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
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
