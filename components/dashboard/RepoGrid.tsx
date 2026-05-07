"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/client";
import type { Repository } from "@/lib/api/types";
import RepoCard from "./RepoCard";

const RepoGrid: React.FC = () => {
  const searchParams = useSearchParams();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    api.repos
      .list(params)
      .then((res) => setRepos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div id="repo-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-52 rounded-2xl animate-pulse"
            style={{ background: "var(--bg-card)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div id="repo-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {repos.length === 0 ? (
        <div
          className="col-span-full flex flex-col items-center justify-center py-24 text-center"
          style={{ color: "var(--text-muted)" }}
        >
          <p className="text-4xl mb-3">🔭</p>
          <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
            No repositories yet
          </p>
          <p className="text-sm mt-1">Waiting for Hermes to sync trending data.</p>
        </div>
      ) : (
        repos.map((repo) => <RepoCard key={repo.full_name} repo={repo} />)
      )}
    </div>
  );
};

export default RepoGrid;
