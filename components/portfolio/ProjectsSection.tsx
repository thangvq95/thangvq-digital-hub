"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Briefcase } from "lucide-react";
import { PROJECTS } from "@/lib/constants";
import { buildStackUrl } from "@/lib/utils";
import ProjectDialog from "./ProjectDialog";

type Project = (typeof PROJECTS)[number];

const ProjectsSection: React.FC = () => {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section id="projects" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-bold text-center mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Featured Projects
        </h2>
        <p
          className="text-center max-w-2xl mx-auto mb-16 text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          A selection of projects that showcase my engineering approach.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PROJECTS.map((project, i) => {
            const stackUrl = buildStackUrl(project.stackProject);

            return (
              <div
                key={project.title}
                data-testid={`project-card-${i}`}
                onClick={() => setSelected(project)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(project);
                  }
                }}
                role="button"
                tabIndex={0}
                className="p-6 rounded-2xl glass card-hover group text-left w-full cursor-pointer transition-all duration-200"
                style={{ border: "1px solid var(--border)" }}
                aria-label={`View details for ${project.title}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {project.title}
                    </h3>
                    {project.type && (
                      <span
                        className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider"
                        style={{
                          background:
                            project.type === "personal"
                              ? "rgba(99, 102, 241, 0.12)"
                              : "rgba(16, 185, 129, 0.12)",
                          color:
                            project.type === "personal"
                              ? "rgb(129, 140, 248)"
                              : "rgb(52, 211, 153)",
                          border:
                            project.type === "personal"
                              ? "1px solid rgba(99, 102, 241, 0.2)"
                              : "1px solid rgba(16, 185, 129, 0.2)",
                        }}
                      >
                        {project.type === "personal" ? (
                          <>
                            <User size={10} />
                            Side Project
                          </>
                        ) : (
                          <>
                            <Briefcase size={10} />
                            Work Project
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  {/* Visual hint that card is clickable */}
                  <span
                    className="opacity-40 group-hover:opacity-80 transition-opacity text-xs mt-1"
                    style={{ color: "var(--accent)" }}
                  >
                    ↗
                  </span>
                </div>
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
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
                  {stackUrl && (
                    <Link
                      href={stackUrl}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="text-xs px-2.5 py-1 rounded-full hover:brightness-110 active:scale-95 transition-all duration-150 font-semibold"
                      style={{
                        background: "var(--accent)",
                        color: "#000",
                      }}
                    >
                      More →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <ProjectDialog project={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
};

export default ProjectsSection;
