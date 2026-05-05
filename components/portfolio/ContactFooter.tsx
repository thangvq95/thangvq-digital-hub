const ContactFooter: React.FC = () => {
  return (
    <footer
      id="contact"
      className="border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2
          className="text-sm font-medium tracking-widest uppercase mb-3"
          style={{ color: "var(--accent)" }}
        >
          Contact
        </h2>
        <p
          className="text-3xl font-bold mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          Let&apos;s build something great
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <a
            id="contact-email"
            href="mailto:thangvq95@gmail.com"
            className="font-medium transition-colors hover:underline"
            style={{ color: "var(--accent)" }}
          >
            thangvq95@gmail.com
          </a>
          <a
            id="contact-github"
            href="https://github.com/thangvq95"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition-colors hover:underline"
            style={{ color: "var(--accent)" }}
          >
            GitHub
          </a>
          <a
            id="contact-linkedin"
            href="https://linkedin.com/in/thangvq95"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition-colors hover:underline"
            style={{ color: "var(--accent)" }}
          >
            LinkedIn
          </a>
        </div>

        <p
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Built with Next.js · Hosted on Vercel · &copy; {new Date().getFullYear()} Thang VQ
        </p>
      </div>
    </footer>
  );
};

export default ContactFooter;
