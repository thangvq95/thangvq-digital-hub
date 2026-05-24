const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Dot grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Accent glow orb */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
        style={{ background: "var(--accent)" }}
      />
      {/* Secondary glow orb */}
      <div
        aria-hidden="true"
        className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[100px] opacity-10"
        style={{ background: "hsl(280, 100%, 70%)" }}
      />

      <div className="relative z-10 text-center px-4 animate-fade-in-up">
        <p
          className="text-sm font-medium tracking-widest uppercase mb-4"
          style={{ color: "var(--accent)" }}
        >
          Software Engineer &middot; 9+ Years in Production
        </p>
        <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tight mb-6">
          <span className="gradient-text">Thang VQ</span>
        </h1>
        <p
          className="text-lg sm:text-xl font-light mb-4 max-w-2xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Building high-performance applications with modern web &amp; mobile stacks
        </p>
        <p
          className="max-w-xl mx-auto text-sm mb-10"
          style={{ color: "var(--text-muted)" }}
        >
          Flutter &amp; mobile as primary career background, now expanding into full-stack web &amp; autonomous software engineering
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#projects"
            id="hero-view-projects"
            className="px-8 py-3 rounded-full font-medium transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 cursor-pointer"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            View Projects
          </a>
          <a
            href="/resume.pdf"
            id="hero-download-cv"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full font-medium glass transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            style={{ color: "var(--text-primary)", border: "1px solid var(--border)" }}
          >
            View CV
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
