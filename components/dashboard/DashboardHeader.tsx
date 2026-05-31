"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api/client";

const TABS = [
  { id: "tab-all", label: "All", value: "all" },
  { id: "tab-favorites", label: "♥ Favorites", value: "favorites" },
  { id: "tab-archived", label: "Archived", value: "archived" },
] as const;

const DashboardHeader: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "all";

  const [isAdding, setIsAdding] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setTab = (tab: string) => {
    const params = new URLSearchParams();
    if (tab !== "all") params.set("tab", tab);
    router.push(`/tech${params.toString() ? `?${params}` : ""}`);
  };

  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUrl.trim()) return;
    setIsSubmitting(true);
    try {
      const repo = await api.repos.add(addUrl);
      setIsAdding(false);
      setAddUrl("");
      router.push(`/tech/${repo.full_name}`);
    } catch {
      alert("Failed to add repo. Check the URL and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header
      id="dashboard-header"
      className="sticky top-0 z-50 glass border-b"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Main row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/tech"
              id="dashboard-home-link"
              className="flex items-center gap-2 group"
            >
              <span
                className="text-lg sm:text-xl font-bold tracking-tight group-hover:opacity-80 transition-opacity"
                style={{ color: "var(--text-primary)" }}
              >
                Tech<span className="gradient-text">Trend</span>
              </span>
            </Link>
            <span
              className="hidden sm:inline text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "var(--accent-glow)",
                color: "var(--accent)",
                border: "1px solid var(--accent-glow-strong)",
              }}
            >
              Live
            </span>
          </div>

          {/* Tab navigation — scrollable on mobile */}
          <div
            className="flex gap-1 p-1 rounded-xl flex-shrink-0"
            style={{ background: "var(--bg-card)" }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.value}
                id={tab.id}
                onClick={() => setTab(tab.value)}
                className="px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap"
                style={
                  currentTab === tab.value
                    ? { background: "var(--accent)", color: "#fff" }
                    : { color: "var(--text-muted)" }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <nav className="flex items-center gap-2 sm:gap-4 relative flex-shrink-0">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5 whitespace-nowrap"
              style={{
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            >
              + Add
            </button>

            <Link
              href="/"
              id="dashboard-portfolio-link"
              className="hidden sm:block text-sm transition-colors hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              Portfolio
            </Link>

            <Link
              href="/learning"
              id="dashboard-learning-link"
              className="hidden sm:block text-sm transition-colors hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              Learning
            </Link>

            <Link
              href="/stack"
              id="dashboard-stack-link"
              className="hidden sm:block text-sm transition-colors hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              Architecture
            </Link>

            {isAdding && (
              <div
                className="absolute top-full right-0 mt-3 p-4 rounded-xl glass shadow-xl w-[calc(100vw-2rem)] sm:min-w-[300px] sm:w-auto"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--bg-card)",
                }}
              >
                <form onSubmit={handleAddRepo} className="flex flex-col gap-3">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Add Repository
                  </label>
                  <input
                    type="text"
                    placeholder="facebook/react or GitHub URL"
                    value={addUrl}
                    onChange={(e) => setAddUrl(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                    className="w-full px-3 py-2 rounded-lg text-sm bg-black/20 outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="text-xs px-3 py-1.5 rounded-lg hover:bg-white/5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !addUrl.trim()}
                      className="text-xs px-4 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                      style={{ background: "var(--accent)", color: "#fff" }}
                    >
                      {isSubmitting ? "Adding..." : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
