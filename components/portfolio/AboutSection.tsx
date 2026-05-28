import { Code2, Cpu, Rocket, Server } from "lucide-react";

const highlights = [
  {
    icon: Code2,
    title: "9+ Years Experience",
    description:
      "Building production applications across multiple startups and enterprise environments.",
  },
  {
    icon: Cpu,
    title: "Mobile-First Expert",
    description:
      "Flutter & Android as primary career background with deep CI/CD and architecture expertise.",
  },
  {
    icon: Server,
    title: "Infrastructure Enthusiast",
    description:
      "Self-hosted Mac Mini M4 Pro production server. Docker, Cloudflare, automated deployments.",
  },
  {
    icon: Rocket,
    title: "AI-Assisted Development",
    description:
      "Exploring Autonomous Software Engineering (ASE) with Hermes Agent and AI-powered workflows.",
  },
];

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl font-bold text-center mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          About Me
        </h2>
        <p
          className="text-center max-w-2xl mx-auto mb-16 text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          Experienced software engineer with a passion for crafting high-quality
          mobile and web experiences. Hard-working, quick-learning, and always
          seeking challenging environments.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {highlights.map((item, i) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl glass card-hover"
              style={{
                border: "1px solid var(--border)",
                animationDelay: `${i * 100}ms`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--accent-glow)" }}
              >
                <item.icon size={20} style={{ color: "var(--accent)" }} />
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {item.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
