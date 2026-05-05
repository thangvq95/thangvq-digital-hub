const PROJECTS: {
  title: string;
  description: string;
  tags: string[];
  link?: string;
}[] = [
  {
    title: "Sổ Giáo Dân Platform",
    description:
      "Parish management platform with Flutter mobile app, Next.js web admin, and Docker self-hosted infrastructure.",
    tags: ["Flutter", "Next.js", "Docker", "PostgreSQL"],
  },
  {
    title: "Care App",
    description:
      "Primary mobile engineer for production health-care application. Implemented CI/CD, clean architecture, and design patterns.",
    tags: ["Flutter", "Dart", "CI/CD", "Clean Architecture"],
  },
  {
    title: "Rovo Sports App",
    description:
      "Sports activity booking app built with Flutter. Full CI/CD pipeline, design patterns, and multi-platform delivery.",
    tags: ["Flutter", "Dart", "Firebase"],
  },
  {
    title: "Self-Hosted Mac Mini Infra",
    description:
      "Production server setup on Mac Mini M4 Pro with Cloudflare Tunnels, Docker Compose, and automated backups to R2.",
    tags: ["Docker", "Cloudflare", "Mac Mini", "DevOps"],
  },
];

const ProjectsSection: React.FC = () => {
  return (
    <section
      id="projects"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
    >
      <h2
        className="text-sm font-medium tracking-widest uppercase mb-3"
        style={{ color: "var(--accent)" }}
      >
        Projects
      </h2>
      <p
        className="text-4xl font-bold mb-12"
        style={{ color: "var(--text-primary)" }}
      >
        Featured Work
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        {PROJECTS.map((project) => (
          <div
            key={project.title}
            id={`project-${project.title.toLowerCase().replace(/\s+/g, "-")}`}
            className="p-6 rounded-2xl glass card-hover group"
            style={{ border: "1px solid var(--border)" }}
          >
            {/* Screenshot placeholder */}
            <div
              className="w-full h-36 rounded-xl mb-4 flex items-center justify-center text-xs"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-muted)",
              }}
            >
              {/* TODO: replace with real screenshot */}
              Screenshot coming soon
            </div>

            <h3
              className="text-lg font-semibold mb-2 group-hover:text-[var(--accent)] transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              {project.title}
            </h3>
            <p
              className="text-sm mb-4 line-clamp-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-md"
                  style={{
                    background: "var(--accent-glow)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;
