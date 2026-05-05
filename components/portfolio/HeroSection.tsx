const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background grid/particle effect placeholder */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Accent glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: "var(--accent)" }}
      />

      <div className="relative z-10 text-center px-4 animate-fade-in-up">
        <p
          className="text-sm font-medium tracking-widest uppercase mb-4"
          style={{ color: "var(--accent)" }}
        >
          Flutter &amp; Android Engineer
        </p>

        <h1 className="text-6xl sm:text-8xl font-bold tracking-tight mb-6">
          <span className="gradient-text">Thang VQ</span>
        </h1>

        <p
          className="text-xl sm:text-2xl font-light mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          10+ Years in Mobile Development
        </p>

        <p
          className="max-w-xl mx-auto text-base mb-10"
          style={{ color: "var(--text-muted)" }}
        >
          Building high-performance mobile experiences with Flutter &amp; Android
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#projects"
            id="hero-view-projects"
            className="px-8 py-3 rounded-full font-medium transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            View Projects
          </a>
          <a
            href="/resume.pdf"
            id="hero-download-cv"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full font-medium glass transition-all duration-200 hover:scale-105"
            style={{
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            Download CV
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
