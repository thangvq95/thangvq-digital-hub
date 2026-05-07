import { api } from "@/lib/api/client";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ repo: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { repo } = await params;
  const fullName = decodeURIComponent(repo);
  return {
    title: `${fullName} — TechTrend`,
    description: `Repository details and release history for ${fullName}.`,
  };
}

export default async function RepoDetailPage({ params }: Props) {
  const { repo: encodedRepo } = await params;
  const fullName = decodeURIComponent(encodedRepo);

  let repoData;
  try {
    repoData = await api.repos.detail(fullName);
  } catch {
    notFound();
  }

  if (!repoData) notFound();

  const rank = repoData.rank_daily ?? repoData.rank_weekly ?? repoData.rank_monthly;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <a
        href="/tech"
        className="text-sm mb-6 inline-block cursor-pointer"
        style={{ color: "var(--accent)" }}
      >
        ← Back to Dashboard
      </a>

      <div className="p-6 rounded-2xl glass mb-6" style={{ border: "1px solid var(--border)" }}>
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {repoData.full_name}
          </h1>
          {rank && (
            <span
              className="text-sm font-bold px-3 py-1 rounded-full"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              #{rank}
            </span>
          )}
        </div>

        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
          {repoData.description ?? "No description available."}
        </p>

        <div className="flex flex-wrap gap-4 text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          <span>⭐ {repoData.stars_total?.toLocaleString()} stars</span>
          {repoData.stars_growth && (
            <span style={{ color: "hsl(142, 71%, 55%)" }}>↑ {repoData.stars_growth}</span>
          )}
          <span>🍴 {repoData.forks_total?.toLocaleString()} forks</span>
          {repoData.language && <span>· {repoData.language}</span>}
        </div>

        {repoData.domains?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {repoData.domains.map((d) => (
              <span
                key={d}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
              >
                {d}
              </span>
            ))}
          </div>
        )}

        <a
          href={repoData.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hover:underline"
          style={{ color: "var(--accent)" }}
        >
          View on GitHub →
        </a>
      </div>
    </main>
  );
}
