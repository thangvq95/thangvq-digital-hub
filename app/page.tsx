import type { Metadata } from "next";
import HeroSection from "@/components/portfolio/HeroSection";
import AboutSection from "@/components/portfolio/AboutSection";
import TechStackSection from "@/components/portfolio/TechStackSection";
import ExperienceSection from "@/components/portfolio/ExperienceSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import ContactFooter from "@/components/portfolio/ContactFooter";

export const metadata: Metadata = {
  title: "ThangVQ — Flutter & Android Engineer",
  description:
    "Portfolio of Thang VQ — Flutter Engineer with 10+ years building high-performance mobile apps across multiple startups.",
};

// Portfolio is statically generated (SSG)
export const dynamic = "force-static";

export default function PortfolioPage() {
  return (
    <main id="portfolio-main">
      <HeroSection />
      <AboutSection />
      <TechStackSection />
      <ExperienceSection />
      <ProjectsSection />
      <ContactFooter />
    </main>
  );
}
