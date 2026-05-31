"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import type { Repository, Category } from "@/lib/api/types";
import RepoCard from "./RepoCard";

const PAGE_SIZE = 20;

const RepoGrid: React.FC = () => {
  const searchParams = useSearchParams();
  const useRouterObj = useRouter();
  const tab = searchParams.get("tab") ?? "all";
  const selectedCategory = searchParams.get("category") ?? "";

  const [repos, setRepos] = useState<Repository[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    api.categories.list().then(setCategories).catch(console.error);
  }, []);

  const loadRepos = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      try {
        const res = await api.repos.list(tab, pageNum, PAGE_SIZE, selectedCategory || undefined);
        if (append) {
          setRepos((prev) => [...prev, ...res.data]);
        } else {
          setRepos(res.data);
        }
        setHasMore(res.data.length === PAGE_SIZE);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [tab, selectedCategory],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    loadRepos(1, false);
  }, [tab, selectedCategory, loadRepos]);

  const handleCategorySelect = (categoryName: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryName) {
      params.set("category", categoryName);
    } else {
      params.delete("category");
    }
    useRouterObj.push(`/tech?${params.toString()}`);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadRepos(nextPage, true);
  };

  const handleRefresh = () => {
    setPage(1);
    loadRepos(1, false);
  };

  const renderCategoryPills = () => {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none flex-nowrap mask-image-horizontal">
        <button
          onClick={() => handleCategorySelect(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer whitespace-nowrap ${
            !selectedCategory
              ? "bg-[var(--accent)] text-white border-transparent shadow-[0_0_12px_rgba(59,130,246,0.3)]"
              : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-white/20"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategorySelect(c.name)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer whitespace-nowrap uppercase tracking-wider ${
              selectedCategory === c.name
                ? "bg-[var(--accent)] text-white border-transparent shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-white/20"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    );
  };

  if (loading && repos.length === 0) {
    return (
      <div>
        {renderCategoryPills()}
        <div id="repo-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-52 rounded-2xl animate-pulse"
              style={{ background: "var(--bg-card)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderCategoryPills()}
      <div id="repo-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {repos.length === 0 ? (
          <div
            className="col-span-full flex flex-col items-center justify-center py-24 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            <p className="text-4xl mb-3">🔭</p>
            <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
              {tab === "favorites"
                ? "No favorite repos yet"
                : tab === "archived"
                  ? "No archived repos"
                  : "No repositories yet"}
            </p>
            <p className="text-sm mt-1">
              {tab === "favorites"
                ? "Heart some repos to see them here."
                : tab === "archived"
                  ? "Archive repos you're not interested in."
                  : "Waiting for Hermes to sync trending data."}
            </p>
          </div>
        ) : (
          repos.map((repo) => (
            <RepoCard key={repo.full_name} repo={repo} onUpdate={handleRefresh} />
          ))
        )}
      </div>
      {hasMore && repos.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            id="load-more-btn"
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2.5 rounded-full text-sm font-medium glass transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            style={{ color: "var(--text-primary)", border: "1px solid var(--border)" }}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default RepoGrid;
