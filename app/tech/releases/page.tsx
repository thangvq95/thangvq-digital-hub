import { api } from "@/lib/api/client";
import ReleaseCard from "@/components/dashboard/ReleaseCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Release Feed — TechTrend",
  description: "AI-analyzed releases from your favorite repositories.",
};

export default async function ReleaseFeedPage() {
  let releases: import("@/lib/api/types").RepoRelease[] = [];
  try {
    const res = await api.releases.list(1, 50);
    releases = res.data;
  } catch {
    // API offline — render empty state gracefully
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <a
        href="/tech"
        className="text-sm mb-6 inline-block cursor-pointer"
        style={{ color: "var(--accent)" }}
      >
        ← Back to Dashboard
      </a>
      <h1
        className="text-2xl font-bold mb-8"
        style={{ color: "var(--text-primary)" }}
      >
        Release Feed
      </h1>
      <div className="space-y-4">
        {releases.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <p className="text-4xl mb-3">📦</p>
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              No releases yet.
            </p>
            <p className="text-sm mt-1">
              Favorite some repos and Hermes will monitor their releases.
            </p>
          </div>
        ) : (
          releases.map((r) => <ReleaseCard key={r.id} release={r} />)
        )}
      </div>
    </main>
  );
}
