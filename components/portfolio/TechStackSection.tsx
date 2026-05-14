import { TECH_STACK } from "@/lib/constants";

const TechStackSection: React.FC = () => {
  return (
    <section id="tech-stack" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-bold text-center mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Tech Stack
        </h2>
        <p
          className="text-center max-w-2xl mx-auto mb-16 text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          Technologies and tools I use daily to build production applications.
        </p>
        <div className="flex justify-center mb-16">
          <a
            href="/stack"
            className="px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            style={{ border: "1px solid var(--accent)", color: "var(--accent)", background: "var(--accent-glow)" }}
          >
            <span>View Interactive Architecture & Stack</span>
            <span>→</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TECH_STACK.map((category, i) => (
            <div
              key={category.name}
              data-testid={`tech-category-${i}`}
              className="p-6 rounded-2xl glass card-hover"
              style={{ border: "1px solid var(--border)", animationDelay: `${i * 80}ms` }}
            >
              <h3
                className="text-base font-semibold mb-4"
                style={{ color: "var(--accent)" }}
              >
                {category.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.items.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-3 py-1.5 rounded-full transition-colors duration-200"
                    style={{
                      background: "var(--bg-card)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {tech}
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

export default TechStackSection;
