const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
    >
      <h2
        className="text-sm font-medium tracking-widest uppercase mb-3"
        style={{ color: "var(--accent)" }}
      >
        About Me
      </h2>
      <p
        className="text-4xl font-bold mb-8"
        style={{ color: "var(--text-primary)" }}
      >
        Crafting mobile experiences
        <br />
        <span className="gradient-text">since 2016</span>
      </p>

      {/* TODO: replace with real content from CV */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4" style={{ color: "var(--text-secondary)" }}>
          <p>
            Experienced Flutter and Android native app developer with a passion for
            high-performance, user-centric mobile applications.
          </p>
          <p>
            Hard-working, quick-learning, and creative — always seeking challenging
            environments that push the boundaries of mobile engineering.
          </p>
        </div>
        <div className="space-y-4" style={{ color: "var(--text-secondary)" }}>
          <p>
            Flutter is my primary focus, with production apps delivered for multiple
            startups. Infrastructure enthusiast running a self-hosted Mac Mini M4 Pro
            production server.
          </p>
          <p>
            Currently exploring Autonomous Software Engineering (ASE) and AI-assisted
            development workflows.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
