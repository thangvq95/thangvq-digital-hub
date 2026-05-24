"use client";

import { useState } from "react";
import { EXPERIENCE, PROJECTS } from "@/lib/constants";
import ProjectDialog from "./ProjectDialog";

interface SelectedProject {
  title: string;
  description: string;
  tags: string[];
  url?: string;
  stackProject?: string | null;
  images?: string[];
  contributions?: string[];
}

const ExperienceSection: React.FC = () => {
  const [selected, setSelected] = useState<SelectedProject | null>(null);

  return (
    <section id="experience" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-bold text-center mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Experience
        </h2>
        <p
          className="text-center max-w-2xl mx-auto mb-16 text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          A decade of building mobile and web applications across startups and
          enterprise.
          <br />
          <span
            className="text-xs font-medium"
            style={{ color: "var(--accent)" }}
          >
            (Click any card to view key contributions & screenshots)
          </span>
        </p>
        <div className="relative">
          {/* Vertical line */}
          <div
            aria-hidden="true"
            className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px"
            style={{ background: "var(--border)" }}
          />
          <div className="space-y-12">
            {EXPERIENCE.map((exp, i) => (
              <div
                key={exp.company}
                data-testid={`exp-entry-${i}`}
                className={`relative flex flex-col sm:flex-row gap-4 ${i % 2 === 0 ? "sm:flex-row-reverse" : ""}`}
              >
                {/* Timeline dot */}
                <div
                  aria-hidden="true"
                  className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full -translate-x-1/2 mt-6 z-10"
                  style={{
                    background: i === 0 ? "var(--accent)" : "var(--border)",
                    boxShadow: i === 0 ? "0 0 12px var(--accent)" : "none",
                  }}
                />
                <div className="w-full sm:w-[calc(50%-2rem)] ml-10 sm:ml-0">
                  <div
                    onClick={() => {
                      const matched = PROJECTS.find(
                        (p) => p.title === exp.projectTitle,
                      );
                      setSelected({
                        title: matched?.title || exp.company,
                        description: matched?.description || exp.highlights,
                        tags: matched?.tags || exp.tags || [],
                        url: matched?.url || undefined,
                        stackProject: matched?.stackProject ?? null,
                        images: matched?.images || [],
                        contributions: exp.contributions,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        const matched = PROJECTS.find(
                          (p) => p.title === exp.projectTitle,
                        );
                        setSelected({
                          title: matched?.title || exp.company,
                          description: matched?.description || exp.highlights,
                          tags: matched?.tags || exp.tags || [],
                          url: matched?.url || undefined,
                          stackProject: matched?.stackProject ?? null,
                          images: matched?.images || [],
                          contributions: exp.contributions,
                        });
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="p-5 rounded-2xl glass card-hover group text-left cursor-pointer transition-all duration-200"
                    style={{ border: "1px solid var(--border)" }}
                    aria-label={`View contributions at ${exp.company}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--accent-glow)",
                          color: "var(--accent)",
                        }}
                      >
                        {exp.duration}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {exp.period}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <h3
                        className="text-lg font-semibold mb-1 group-hover:text-accent transition-colors duration-150"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {exp.company}
                      </h3>
                      <span
                        className="opacity-40 group-hover:opacity-80 transition-opacity text-xs mt-1"
                        style={{ color: "var(--accent)" }}
                      >
                        ↗
                      </span>
                    </div>
                    <p
                      className="text-sm font-medium mb-2"
                      style={{ color: "var(--accent)" }}
                    >
                      {exp.role}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {exp.highlights}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 text-center">
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Education
          </p>
          <p style={{ color: "var(--text-primary)" }}>
            Ton Duc Thang University — B.S. Computer Science (2013–2017)
          </p>
        </div>
      </div>

      {selected && (
        <ProjectDialog project={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
};

export default ExperienceSection;
