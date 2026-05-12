import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ThangVQ — Flutter Engineer",
    template: "%s | ThangVQ",
  },
  description:
    "Thang VQ — Flutter & Android Engineer with 10+ years of experience building high-performance mobile applications. Explore my portfolio and TechTrend dashboard.",
  keywords: ["Flutter", "Android", "Mobile Engineer", "Dart", "Kotlin", "ThangVQ"],
  authors: [{ name: "Thang VQ", url: "https://thangvq95.page" }],
  creator: "Thang VQ",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://thangvq95.page",
    siteName: "ThangVQ Digital Hub",
    title: "ThangVQ — Flutter & Android Engineer",
    description:
      "10+ years building high-performance mobile experiences with Flutter & Android.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThangVQ — Flutter & Android Engineer",
    description:
      "10+ years building high-performance mobile experiences with Flutter & Android.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceGrotesk.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
