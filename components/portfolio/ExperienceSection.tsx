import { EXPERIENCE } from "@/lib/constants";

const ExperienceSection: React.FC = () => {
  return (
    <section
      id="experience"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
    >
      <h2
        className="text-sm font-medium tracking-widest uppercase mb-3"
        style={{ color: "var(--accent)" }}
      >
        Experience
      </h2>
      <p
        className="text-4xl font-bold mb-12"
        style={{ color: "var(--text-primary)" }}
      >
        Career Timeline
      </p>

      <div className="relative">
        {/* Timeline line */}
        <div
          className="absolute left-4 top-0 bottom-0 w-px"
          style={{ background: "var(--border)" }}
        />

        <div className="space-y-8 pl-12">
          {EXPERIENCE.map((job, idx) => (
            <div
              key={idx}
              id={`experience-${job.company.toLowerCase().replace(/\s+/g, "-")}`}
              className="relative"
            >
              {/* Timeline dot */}
              <div
                className="absolute -left-9 top-1 w-3 h-3 rounded-full border-2 animate-pulse-glow"
                style={{
                  background: "var(--accent)",
                  borderColor: "var(--bg-primary)",
                }}
              />

              <div
                className="p-6 rounded-2xl glass card-hover"
                style={{ border: "1px solid var(--border)" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {job.role}
                    </h3>
                    <p
                      className="font-medium"
                      style={{ color: "var(--accent)" }}
                    >
                      {job.company}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {job.period}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {job.duration}
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {job.highlights}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div
        className="mt-12 p-6 rounded-2xl glass"
        style={{ border: "1px solid var(--border)" }}
      >
        <p
          className="text-xs font-semibold tracking-wider uppercase mb-1"
          style={{ color: "var(--accent)" }}
        >
          Education
        </p>
        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
          Ton Duc Thang University
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          Bachelor&apos;s in Computer Science · 2013–2017
        </p>
      </div>
    </section>
  );
};

export default ExperienceSection;
