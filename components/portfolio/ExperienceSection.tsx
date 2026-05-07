import { EXPERIENCE } from "@/lib/constants";

const ExperienceSection: React.FC = () => {
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
          A decade of building mobile and web applications across startups and enterprise.
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
                    className="p-5 rounded-2xl glass card-hover"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
                      >
                        {exp.duration}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {exp.period}
                      </span>
                    </div>
                    <h3
                      className="text-lg font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {exp.company}
                    </h3>
                    <p
                      className="text-sm font-medium mb-2"
                      style={{ color: "var(--accent)" }}
                    >
                      {exp.role}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {exp.highlights}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 text-center">
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-muted)" }}>
            Education
          </p>
          <p style={{ color: "var(--text-primary)" }}>
            Ton Duc Thang University — B.S. Computer Science (2013–2017)
          </p>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
