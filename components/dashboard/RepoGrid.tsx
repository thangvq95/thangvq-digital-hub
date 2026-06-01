"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    api.categories.list().then(setCategories).catch(console.error);
  }, []);

  const loadRepos = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      try {
        const res = await api.repos.list(
          tab,
          pageNum,
          PAGE_SIZE,
          selectedCategory || undefined,
        );
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

  const renderCategoryDropdown = () => {
    return (
      <div className="relative inline-block text-left mb-6">
        <div>
          <button
            id="category-dropdown-btn"
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex items-center justify-between w-52 rounded-xl border border-[var(--border)] bg-black/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:bg-black/50 hover:border-white/20 transition-all cursor-pointer font-mono"
          >
            <span>Category: {selectedCategory ? selectedCategory : "ALL"}</span>
            <ChevronDown
              size={14}
              className={`ml-2 h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {dropdownOpen && (
          <>
            {/* Click outside to close */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />

            <div className="absolute left-0 mt-2 w-52 origin-top-left rounded-xl border border-[var(--border)] bg-[#0F172A]/95 backdrop-blur-md shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-20 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="py-1">
                <button
                  onClick={() => {
                    handleCategorySelect(null);
                    setDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between w-full text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer font-mono ${
                    !selectedCategory
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                  }`}
                >
                  ALL
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      handleCategorySelect(c.name);
                      setDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer font-mono ${
                      selectedCategory === c.name
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading && repos.length === 0) {
    return (
      <div>
        {renderCategoryDropdown()}
        <div
          id="repo-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
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
      {renderCategoryDropdown()}
      <div
        id="repo-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {repos.length === 0 ? (
          <div
            className="col-span-full flex flex-col items-center justify-center py-24 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            <p className="text-4xl mb-3">🔭</p>
            <p
              className="text-lg font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
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
            <RepoCard
              key={repo.full_name}
              repo={repo}
              onUpdate={handleRefresh}
            />
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
            style={{
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default RepoGrid;
