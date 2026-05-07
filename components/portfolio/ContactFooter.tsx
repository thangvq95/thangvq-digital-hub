import { GITHUB_URL, LINKEDIN_URL } from "@/lib/constants";
import { Globe, Link, Mail } from "lucide-react";

const socialLinks = [
  { id: "footer-github-link", href: GITHUB_URL, label: "GitHub", icon: Globe },
  { id: "footer-linkedin-link", href: LINKEDIN_URL, label: "LinkedIn", icon: Link },
  { id: "footer-email-link", href: "mailto:thangvq95@gmail.com", label: "Email", icon: Mail },
];

const ContactFooter: React.FC = () => {
  return (
    <footer id="contact-footer" className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Get In Touch
        </h2>
        <p
          className="max-w-lg mx-auto mb-10 text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          Open to interesting opportunities and collaborations. Let&apos;s connect.
        </p>
        <div className="flex justify-center gap-6 mb-12">
          {socialLinks.map((link) => (
            <a
              key={link.id}
              id={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full glass flex items-center justify-center transition-all duration-200 hover:-translate-y-1 cursor-pointer"
              style={{ border: "1px solid var(--border)" }}
              aria-label={link.label}
            >
              <link.icon size={20} style={{ color: "var(--text-secondary)" }} />
            </a>
          ))}
        </div>
        <div className="pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Built with Next.js &middot; Hosted on Vercel &middot; &copy; {new Date().getFullYear()} Thang VQ
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ContactFooter;
