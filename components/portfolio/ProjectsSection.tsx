import { PROJECTS } from "@/lib/constants";
import { ExternalLink } from "lucide-react";

const ProjectsSection: React.FC = () => {
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
          {PROJECTS.map((project, i) => (
            <div
              key={project.title}
              data-testid={`project-card-${i}`}
              className="p-6 rounded-2xl glass card-hover group"
              style={{ border: "1px solid var(--border)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {project.title}
                </h3>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ color: "var(--text-secondary)" }}
                    aria-label={`Visit ${project.title}`}
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
