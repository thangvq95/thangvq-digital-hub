import { TECH_STACK } from "@/lib/constants";

const TechStackSection: React.FC = () => {
  return (
    <section
      id="tech-stack"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
    >
      <h2
        className="text-sm font-medium tracking-widest uppercase mb-3"
        style={{ color: "var(--accent)" }}
      >
        Tech Stack
      </h2>
      <p
        className="text-4xl font-bold mb-12"
        style={{ color: "var(--text-primary)" }}
      >
        Tools &amp; Technologies
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TECH_STACK.map((category) => (
          <div
            key={category.name}
            id={`techstack-${category.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="p-6 rounded-2xl card-hover glass"
            style={{ border: "1px solid var(--border)" }}
          >
            <h3
              className="text-xs font-semibold tracking-wider uppercase mb-3"
              style={{ color: "var(--accent)" }}
            >
              {category.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.items.map((item) => (
                <span
                  key={item}
                  className="text-xs px-2 py-1 rounded-md"
                  style={{
                    background: "var(--accent-glow)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TechStackSection;
